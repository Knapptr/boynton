import { useContext, useState, useEffect, useCallback } from "react";
import { MenuSelector } from "../components/styled";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw from 'twin.macro';
import 'styled-components/macro';
import styled from "styled-components";

const StaffSelectionSources = {
  UNASSIGNED: () => "UNASSIGNED",
  ACTIVITY: (activity) => activity.sessionId
}
const StaffSchedule = () => {
  const auth = useContext(UserContext);

  const [weeks, setWeeks] = useState([]);

  const [selectedWeek, setSelectedWeek] = useState(null);

  const [selectedDay, setSelectedDay] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [viableStaff, setViableStaff] = useState([]);

  const [selectedStaff, setSelectedStaff] = useState([]);

  /** Add all selected staff to activity */
  const addSelectedToActivity = async (activity, activityIndex) => {
    const url = `/api/activity-sessions/${activity.sessionId}/staff`
    const allRequests = selectedStaff.map(data => {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffSessionId: data.staffer.staffSessionId })
      }
      return fetchWithToken(url, options, auth);
    })
    //// DO EAGER UPDATE
    eagerUpdateInsertion(selectedStaff, activityIndex);
    // Clear Selection after update
    clearSelectedStaff();
    //// On DB response
    try {
      await Promise.all(allRequests);
      // Update accordingly
      fetchViableStaff(selectedPeriod);
      fetchActivities()
    } catch (e) {
      console.log("Something went wrong.")
      console.log(e);
    }

  }

  /** Remove individual staff from activity */
  const removeFromActivity = async (sourceIndex, staffer) => {
    clearSelectedStaff();
    const source = activities[sourceIndex];
    const url = `/api/activity-sessions/${source.sessionId}/staff/${staffer.staffActivityId}`
    const options = {
      method: "DELETE"
    }
    // EAGER UPDATE
    eagerUpdateRemoval(sourceIndex, staffer)
    try {
      // API CALL
      const result = await fetchWithToken(url, options, auth);
      if (!result) { throw new Error("Could not delete") }
      // Update from DB
      fetchViableStaff(selectedPeriod);
      fetchActivities();
    } catch (e) {
      //TODO handle this case 
      console.log("Something went wrong. TODO")
    }
  }
  /** Get unassigned staff for period */
  const fetchViableStaff = useCallback(async (period) => {
    const result = await fetchWithToken(`/api/staff-sessions/period/${period.id}/viable`, {}, auth);
    if (!result) {
      // no viable staff, OR no staff sessions
      console.log("no staff. Handle this")
    }
    const viableStaffAssignments = await result.json();
    setViableStaff(viableStaffAssignments);
  }, [auth])



  /** Update Staffing UI Eagerly on adding to activity before DB update */
  const eagerUpdateInsertion = (sourceStaffList, destinationIndex) => {
    let newViable = [...viableStaff];
    let newActivities = [...activities];
    for (const { sourceIndex, staffer } of sourceStaffList) {
      if (sourceIndex === destinationIndex) { continue }
      // REMOVAL
      //find where the source is coming from update lists accordingly
      //remove from source
      if (sourceIndex === StaffSelectionSources.UNASSIGNED()) {
        newViable = newViable.filter(s => s.staffSessionId !== staffer.staffSessionId)
      } else {
        //copy the list of staff from activity at sourceIndex
        // Uptade at the source Index and remove staff
        let newStaffList = [...newActivities[sourceIndex].staff].filter(s => s.staffSessionId !== staffer.staffSessionId)
        //update activities list
        newActivities[sourceIndex].staff = newStaffList;
      }
      // INSERTION
      const newStaffList = [...newActivities[destinationIndex].staff, staffer];
      // Sort to prevent reordering
      newStaffList.sort((a, b) => a.firstName.localeCompare(b.firstName));
      // update
      newActivities[destinationIndex].staff = newStaffList
    }

    setActivities(newActivities);
    setViableStaff(newViable);
  }

  /** Eagerly update UI on removal of staff  from activity */
  const eagerUpdateRemoval = (sourceIndex, staffer) => {
    // Removal
    const newActivities = [...activities];
    let newStaffList = [...newActivities[sourceIndex].staff];
    console.log({ before: newStaffList });
    newStaffList = newStaffList.filter(s => s.staffSessionId !== staffer.staffSessionId)
    newActivities[sourceIndex].staff = newStaffList;
    setActivities(newActivities);
    // Insertion
    // sort to avoid reordering
    const newViable = [...viableStaff, staffer];
    newViable.sort((a, b) => a.firstName.localeCompare(b.firstName));
    setViableStaff(newViable);
  }

  const [activities, setActivities] = useState([]);


  //** Clear Activities
  const clearActivities = () => {
    setActivities([]);
  }
  //** Get staff for selected period
  const fetchActivities = useCallback(async () => {
    if (selectedPeriod !== null) {
      const result = await fetchWithToken(`/api/periods/${selectedPeriod.id}`, {}, auth)
      const periodData = await result.json();
      setActivities(periodData.activities);
    }
  }, [selectedPeriod, auth])



  /** Set assignedstaff on mount */
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities])

  const handleSelectStaff = (sourceIndex, staffer) => {
    if (isSelected(staffer)) {
      setSelectedStaff(st => st.filter(s => s.staffer !== staffer))
    } else {
      setSelectedStaff(st => [...st, { sourceIndex, staffer }])
    }
  }

  const clearSelectedStaff = () => {
    setSelectedStaff([]);
  }

  const isSelected = (staffer) => {
    return selectedStaff.find(s => staffer === s.staffer) !== undefined
  }
  const selectWeek = (week) => {
    clearActivities();
    clearSelectedStaff();
    setSelectedPeriod(null);
    setSelectedDay(null);
    setSelectedWeek(week);
    setViableStaff([]);
  }

  const selectDay = (day) => {
    clearActivities()
    clearSelectedStaff();
    setSelectedPeriod(null);
    setSelectedDay(day);
    setViableStaff([]);
  }

  const selectPeriod = (period) => {
    clearActivities();
    clearSelectedStaff()
    setSelectedPeriod(period);
    fetchViableStaff(period)
  }


  // get all weeks
  useEffect(() => {
    const getWeeks = async () => {
      const weeks = await fetchWithToken("/api/weeks", {}, auth);
      const data = await weeks.json();
      setWeeks(data)
    }
    getWeeks();
  }, [auth])


  return (
    <>
      <ul tw="flex justify-center sm:justify-evenly gap-2">
        {weeks.map((week) => {
          return (
            <li onClick={() => { selectWeek(week) }} key={`week-${week.number}`}>
              <MenuSelector isSelected={selectedWeek && week.number === selectedWeek.number} >
                <h2><span tw="hidden  sm:block">Week</span> {week.number} </h2><span tw="hidden sm:block text-xs font-thin">{week.title}</span>
              </MenuSelector>
            </li>
          )
        })}
      </ul>
      <ul tw="flex justify-center">
        {selectedWeek !== null && selectedWeek.days.map(d => <li key={`day-${d.id}`} onClick={() => { selectDay(d) }}><MenuSelector isSelected={selectedDay && selectedDay.id === d.id} >{d.name}</MenuSelector></li>)}
      </ul>

      <ul tw="flex justify-center">
        {selectedDay && selectedDay.periods.map(p => <li key={`period-${p.id}`} onClick={() => selectPeriod(p)}><MenuSelector isSelected={selectedPeriod && selectedPeriod.id === p.id}>Act {p.number}</MenuSelector></li>)}
      </ul>
      {/* Staff Goes Here */}
      <h1>Available Staff</h1>
      <ViableStaffList isSelected={isSelected} staff={viableStaff} selectStaff={handleSelectStaff} />
      {/* Acts go Here */}
      <h1>Activities</h1>
      {selectedPeriod !== null && <ActivityStaffList remove={removeFromActivity} activities={activities} isSelected={isSelected} selectStaff={handleSelectStaff} selectedPeriod={selectedPeriod} handleActivityAssignment={addSelectedToActivity} />}
    </>
  )
}

const ViableStaffList = ({ staff, selectStaff, isSelected }) => {
  return (
    <ul tw="flex justify-center">
      {staff.map(staffer => (
        <li onClick={(e) => { e.preventDefault(); selectStaff(StaffSelectionSources.UNASSIGNED(), staffer) }} key={`viable-staff-${staffer.staffSessionId}`}>
          <StaffListing isSelected={isSelected(staffer)} staffer={staffer} />
        </li>
      ))}
    </ul>
  )
}

const ActivityStaffList = ({ activities, selectStaff, isSelected, handleActivityAssignment, remove }) => {
  const auth = useContext(UserContext);



  return (
    <ul tw="flex  flex-wrap justify-center gap-4">
      {activities.map((activity, activityIndex) =>
        <li onClick={(e) => {
          e.stopPropagation();
          handleActivityAssignment(activity, activityIndex)
        }
        } key={`activity-${activity.sessionId}`} tw="p-4 bg-blue-50 flex flex-col">{activity.name}
          <span> {activity.campers.length} campers</span>
          <ul >
            <header>
              <h2>{(activity.staff.length === 0 && "No staff assigned") || "Assigned"}</h2></header>
            {activity.staff.map(staffer => (
              <li tw="flex items-center" onClick={(e) => { e.stopPropagation(); selectStaff(activityIndex, staffer) }} key={`activity-staff-${staffer.staffSessionId}`}>
                <StaffListing removeable remove={e => { e.stopPropagation(); remove(activityIndex, staffer) }} isSelected={isSelected(staffer)} staffer={staffer} />
              </li>))}
          </ul>

        </li>)}
    </ul>
  )
}

const StaffListing = ({ staffer, isSelected, removeable, remove }) => {
  return (
    <div tw="select-none cursor-pointer px-2 py-1 bg-cyan-100 rounded-full shadow flex border gap-2 justify-center items-center" css={[isSelected && tw`bg-cyan-700`]} >
      <h3 tw="text-xl">{staffer.firstName} {staffer.lastName}</h3>
      <ul tw="flex gap-2" id={`badges-${staffer.staffSessionId}`}>
        {staffer.firstYear && <StaffBadge firstYear>FY</StaffBadge>}
        {staffer.senior && <StaffBadge senior>SR</StaffBadge>}
        {staffer.lifeguard && <StaffBadge lifeguard >LG</StaffBadge>}
        {staffer.ropes && <StaffBadge ropes >RO</StaffBadge>}
        {staffer.archery && <StaffBadge archery >AR</StaffBadge>}

      </ul>
      {removeable && remove && <button onClick={remove}>X</button>}
    </div >
  )
}

const StaffBadge = styled.li(({ lifeguard, senior, firstYear, ropes, archery }) => [
  tw`text-xs bg-gray-50 font-bold p-1 rounded-full`,
  firstYear && tw`text-green-500`,
  senior && tw`text-black`,
  lifeguard && tw`text-red-500`,
  ropes && tw`text-amber-500`,
  archery && tw`text-yellow-500`




])

export default StaffSchedule
