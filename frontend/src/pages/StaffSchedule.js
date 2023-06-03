import { useContext, useState, useEffect, useCallback } from "react";
import { MenuSelector } from "../components/styled";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw from 'twin.macro';
import 'styled-components/macro';
import styled from "styled-components";

const StaffSchedule = () => {
  const auth = useContext(UserContext);

  const [weeks, setWeeks] = useState([]);

  const [selectedWeek, setSelectedWeek] = useState(null);

  const [selectedDay, setSelectedDay] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [viableStaff, setViableStaff] = useState([]);

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


  const selectWeek = (week) => {
    setSelectedPeriod(null);
    setSelectedDay(null);
    setSelectedWeek(week);
    setViableStaff([]);
  }

  const selectDay = (day) => {
    setSelectedPeriod(null);
    setSelectedDay(day);
    setViableStaff([]);
  }

  const selectPeriod = (period) => {
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
      <ViableStaffList staff={viableStaff} />
      {/* Acts go Here */}
      <h1>Activities</h1>
      {selectedPeriod !== null && <ActivityStaffList selectedPeriod={selectedPeriod} />}
    </>
  )
}

const ViableStaffList = ({ staff }) => {
  return (
    <ul tw="flex justify-center">
      {staff.map(staffer => (
        <li key={`viable-staff-${staff.staffSessionId}`}>
          <StaffListing staffer={staffer} />
        </li>
      ))}
    </ul>
  )
}

const ActivityStaffList = ({ selectedPeriod }) => {
  const auth = useContext(UserContext);


  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  //
  //** Get staff for selected period
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const result = await fetchWithToken(`/api/periods/${selectedPeriod.id}`, {}, auth)
    const periodData = await result.json();
    setActivities(periodData.activities);
    setLoading(false)
  }, [selectedPeriod, auth])


  /** Set assignedstaff on mount */
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities])

  return (
    <ul tw="flex  flex-wrap justify-center gap-4">
      {!loading && activities.map(activity => <li key={`activity-${activity.sessionId}`} tw="p-4 bg-blue-50 flex flex-col">{activity.name}
        <span> {activity.campers.length} campers</span>
        <ul>
          <header><h2>{(activity.staff.length === 0 && "No staff assigned") || "Assigned"}</h2></header>
          {activity.staff.map(staffer => <li key={`activity-staff-${staffer.staffSessionId}`}><StaffListing staffer={staffer} /></li>)}
        </ul>

      </li>)}
    </ul>
  )
}

const StaffListing = ({ staffer }) => {
  return (
    <div tw="px-2 py-1 bg-cyan-100 rounded-full shadow flex border gap-2 justify-center items-center">
      <h3 tw="text-xl">{staffer.firstName} {staffer.lastName}</h3>
      <ul tw="flex gap-2" id={`badges-${staffer.staffSessionId}`}>
        {staffer.firstYear && <StaffBadge firstYear>FY</StaffBadge>}
        {staffer.senior && <StaffBadge senior>SR</StaffBadge>}
        {staffer.lifeguard && <StaffBadge lifeguard >LG</StaffBadge>}
        {staffer.ropes && <StaffBadge ropes >RO</StaffBadge>}
        {staffer.archery && <StaffBadge archery >AR</StaffBadge>}

      </ul>
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
