import { useCallback, useContext, useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { CancelButton, ConfirmButton, DialogBox, MenuSelector, PopOut } from "../components/styled";
import UserContext from "../components/UserContext";

const dayDictionary = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday"
}

const ProgrammingSchedule = () => {
  const auth = useContext(UserContext);

  const [activities, _, updateActivities] = useGetDataOnMount({
    url: "/api/activities",
    initialState: [],
    useToken: true
  })

  // get the list of weeks
  const [weeks, setWeeks] = useState([]);
  // selectedWeekId is mainly concerned with the selection menu and UI logic
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(undefined);
  // current Week is data fetched from /api/weeks/:weekid
  const [currentWeek, setCurrentWeek] = useState(undefined);

  const [selectedDayIndex, setSelectedDayIndex] = useState(undefined);

  const selectDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex)
  }

  const getSelectedDay = () => {
    if (!currentWeek) { return undefined }
    return currentWeek.days[selectedDayIndex]
  }

  const getWeeks = useCallback(async () => {
    const response = await fetchWithToken("/api/weeks", {}, auth)
    if (!response || response.status !== 200) { console.log("Something went wrong!"); return; }
    const data = await response.json();
    setWeeks(data);
  }, [auth])

  const getWeek = useCallback(async (weekNumber) => {
    const response = await fetchWithToken(`/api/weeks/${weekNumber}`, {}, auth)
    if (!response || response.status !== 200) { console.log("Something went wrong!"); return; }
    const data = await response.json();
    setCurrentWeek(data);
  }, [auth])


  useEffect(() => {
    getWeeks();
  }, [getWeeks])

  const selectWeek = (weekNumber) => {
    // clear the selected day
    setSelectedDayIndex(undefined);
    // Select for menu
    setSelectedWeekNumber(weekNumber);
    // fetch weeks data
    getWeek(weekNumber);
  }
  const [createActivityData, setCreateActivityData] = useState({ showWindow: false, name: "", description: "", periodId: null });
  const [selectActivityData, setSelectActivityData] = useState({ showWindow: false, selection: undefined, period: undefined });

  const closeCreatePopOut = () => {
    setCreateActivityData(d => ({ ...d, showWindow: false }));
  }

  const closeAddPopout = () => {
    setSelectActivityData(d => ({ ...d, showWindow: false }));
  }
  // const openAddPopout = () => {
  //   setSelectActivityData(d => ({ ...d, showWindow: true }));
  // }

  /** Begin the creation of an activity, display a popup with relevant fields.
    * @param periodId {periodId} the period for which to instantiate a session of the newly created activity */
  const beginCreateActivity = (periodId) => {
    // close the select activity window
    closeAddPopout()
    setCreateActivityData({ showWindow: true, name: "", description: "", periodId });
  }
  /** Begin the creation of an activity session
    * @param periodId {periodId} the period for which to create the session */
  const beginAddActivity = (period) => {
    // openAddPopout();
    setSelectActivityData({ showWindow: true, currentSelection: undefined, period });
  }

  /** things to do after creating activity and activity session with activity creator
    */
  const afterActivityCreation = async () => {
    await getWeek(selectedWeekNumber);
    closeCreatePopOut();
    updateActivities();
  }

  const requestAddActivitySession = async (activityId, periodId) => {
    const url = "/api/activity-sessions"
    const data = { activityId, periodId };
    const opts = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    }

    const response = await fetchWithToken(url, opts, auth);
    return response
  }

  const requestDeleteActivitySession = async (activitySessionId) => {
    const url = `/api/activity-sessions/${activitySessionId}`;
    const opts = { method: "DELETE" };
    const response = await fetchWithToken(url, opts, auth);
    return response;
  }

  const [waitingForDeleteRequest, setWaitingForDeleteRequest] = useState(null);
  const handleDeleteRequest = async (activitySessionId) => {
    setWaitingForDeleteRequest(activitySessionId);
    const response = await requestDeleteActivitySession(activitySessionId);
    if (response.status !== 202) {
      console.log("Could not delete activity session");
      return;
    }
    console.log("Deleted activity session");
    await getWeek(selectedWeekNumber);
    setWaitingForDeleteRequest(null);

  }

  return (
    <>
      <div tw="w-full">
        {createActivityData.showWindow &&
          <PopOut shouldDisplay={true} onClick={closeCreatePopOut}>
            <CreateActivity data={createActivityData} setData={setCreateActivityData} close={closeCreatePopOut} addActivitySession={requestAddActivitySession} afterCreation={afterActivityCreation} />
          </PopOut>
        }
        {selectActivityData.showWindow &&
          <PopOut shouldDisplay={true} onClick={closeAddPopout}>
            <AddActivityBox activities={activities} addActivitySession={requestAddActivitySession} week={currentWeek} day={currentWeek.days[selectedDayIndex]} period={selectActivityData.period} close={closeAddPopout} createActivity={beginCreateActivity} updateWeek={() => getWeek(selectedWeekNumber)} />
          </PopOut>
        }
        <ul tw="flex justify-center sm:justify-evenly gap-2">
          {weeks.map((week, weekIndex) => {
            return (
              <MenuSelector key={`week-select-${week.number}`} onClick={() => { selectWeek(week.number) }} isSelected={selectedWeekNumber && week.number === selectedWeekNumber} >
                <h2><span tw="hidden  sm:block">Week</span> {week.number} </h2><span tw="hidden sm:block text-xs font-thin">{week.title}</span>
              </MenuSelector>
            )
          })}
        </ul>
        < ul tw="flex justify-center sm:justify-evenly gap-2"> {selectedWeekNumber !== undefined && currentWeek && currentWeek.days.map((day, dayIndex) =>
          <MenuSelector key={`day-select-${day.id}`} onClick={(e) => { e.stopPropagation(); selectDay(dayIndex) }} isSelected={getSelectedDay() && day.id === getSelectedDay().id}> <h3>{day.name}</h3></MenuSelector>
        )
        }
        </ul >
        {/* PERIODS */}
        <ul tw="grid grid-cols-2 sm:flex justify-center gap-4"> {getSelectedDay() !== undefined && getSelectedDay().periods.map((period) => {
          return <li tw="w-full border-r last:border-none px-2" key={`period-select-${period.id}`} ><h1 tw="font-bold text-lg">Act {period.number}</h1>
            <ul tw="w-full">
              <button onClick={() => { beginAddActivity(period) }} tw="bg-green-200 rounded shadow-sm border border-black w-full text-xs px-1">+ Add Activity</button>
              {period.activities.map(activity => <li tw="even:bg-cyan-100 flex justify-between py-1 px-2" key={`activity-list-${activity.id}`}>{activity.name}
                {waitingForDeleteRequest !== activity.sessionId && <button tw="p-1 bg-red-500 text-white font-bold text-lg rounded" onClick={() => { handleDeleteRequest(activity.sessionId) }}>-</button>}
                {waitingForDeleteRequest === activity.sessionId && <button tw="py-1 px-2 text-white font-bold text-lg rounded bg-yellow-700 cursor-default" ></button>}

              </li>)}
            </ul>
          </li>
        })}
        </ul>
      </div>
    </>
  )

}

/** @callback activityAdder
  * @param activityId
  * @param periodId
  */
/** Activity box with search bar 
  * @param props {Object}
  * @param props.period {period}
  * @param props.day {day}
  * @param props.close function to close popup
  * @param props.addActivitySession {activityAdder}
  * @param props.createActivity called when pressing "create activity"
  * @param props.updateWeek called after creating session
  */
const AddActivityBox = ({ week, period, day, close, addActivitySession, createActivity, activities, updateWeek }) => {
  // get list of activities
  const [searchResults, setSearchResults] = useState([]);

  const [activityField, setActivityField] = useState("");

  const [selectedActivity, setSelectedActivity] = useState(undefined);
  const [selectedActivityId, setSelectedActivityId] = useState("");

  const makeSelection = (e) => {
    setSelectedActivityId(e.target.value);
    const activity = activities.find(act => act.id === Number.parseInt(e.target.value));
    setSelectedActivity(activity);
  }

  const closeAndClear = () => {
    makeSelection({ target: { value: "" } }); setActivityField("");
    close();
  }

  const handleChange = (e) => {
    setActivityField(e.target.value);
  }

  const search = useCallback((string) => {
    const newResults = activities.filter(a => a.name.toLowerCase().includes(string.toLowerCase()))

    // Clear current selection if results dont include it
    if (newResults.every(act => act !== selectedActivity)) {
      setSelectedActivity(undefined);
    }
    //Set results
    setSearchResults(newResults);
  }, [activities, selectedActivity])

  //Search on loading activities
  useEffect(() => {
    search(activityField);
  }, [activities, activityField, search])

  const handleSubmit = async () => {
    if (selectedActivity !== undefined) {
      const actSessResponse = await addActivitySession(selectedActivity.id, period.id)
      if (actSessResponse.status === 400) {
        closeAndClear();
        const message = await actSessResponse.text();
        console.log(message);
        return;
      }
      console.log({ actSessResponse });
      await updateWeek()
      closeAndClear()
    }

  }
  return (
    <DialogBox close={closeAndClear}  >
      <div>
        <h1>Week {week.number} <span tw="block text-xs font-thin">{week.title}</span></h1>
      </div>

      <h2 tw="bg-red-600"> Add activity to {dayDictionary[day.name]} Act. {period.number}</h2>
      <div tw="flex flex-col items-center md:justify-center h-full py-8 w-full">
        <div tw="flex flex-col sm:flex-row flex-wrap gap-4 w-full" >
          <div id="searchArea" tw="border-r border-b flex flex-col w-full sm:w-1/3 bg-gray-200 p-3">
            <div>
              <div tw="w-full flex">
                <label htmlFor="activityField">Search</label>
                <input tw="px-2 py-1" autoComplete="off" id="activityField" placeholder="Activity Name" value={activityField} onChange={handleChange} />
              </div>
              <select id="activity-matches" tw="w-full" size={8} onChange={makeSelection} value={selectedActivityId}>
                <option disabled value="">Choose an Activity</option>
                {searchResults.map(act => <option tw="text-right odd:bg-cyan-50" key={`act-option-${act.id}`} value={act.id}>{act.name}</option>)}
              </select>
            </div>
            <div tw="p-4">
              <ConfirmButton enabled={true} onClick={() => { createActivity(period.id); closeAndClear() }}>Create New</ConfirmButton>
            </div>
          </div>
          {selectedActivity &&
            <div id="infoArea" tw="w-full sm:w-1/2">
              <h1 tw="bg-green-400 "><span tw="font-bold text-lg">{selectedActivity.name}</span>
              </h1>
              <div tw="text-left pt-4 ">
                <p>{selectedActivity.description}</p>
              </div>
            </div>
          }
        </div>
        <footer tw="py-4">
        </footer>
        <div tw="absolute bottom-4  flex gap-4">
          <CancelButton onClick={closeAndClear}>Nevermind</CancelButton>
          <ConfirmButton enabled={selectedActivity !== undefined} onClick={handleSubmit}>Add</ConfirmButton>

        </div>
      </div>
    </DialogBox >)
}

/** Window for creating an activity 
  * @param props {Object}
  * @param props.setData setState for the data*
  * @param props.data {Object}
  * @param props.data.showWindow {boolean} whether to display the popup or not
  * @param props.data.name {string} the name of the new activity
  * @param props.data.description {string} the description of the new activity
  * @param props.data.periodId {number} the Id of the period of which to instantiate a new session of the activity, once it is created
  * @param props.close the function to close the popout window
  * @param props.addActivitySession function that is called after creating a new activity, to automatically create an activity session for the selected period
  * @param props.afterCreation function that is called after all other calls to DB finish
  * */
const CreateActivity = ({ data, setData, close, addActivitySession, afterCreation }) => {
  const auth = useContext(UserContext);

  const handleChange = (e) => {
    setData(d => ({ ...d, [e.target.name]: e.target.value }))
  }

  const createActivity = async () => {
    const act = { name: data.name, description: data.description }
    const url = "/api/activities"
    const options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(act)
    }

    const result = await fetchWithToken(url, options, auth)
    if (result.status === 400) {
      close();
      const message = await result.text();
      console.log(message); return;
    }
    const { id } = await result.json();
    // Create a session for the activity
    await addActivitySession(id, data.periodId);
    afterCreation();
  }

  const isConfirmEnabled = () => {
    if (data.name.length > 0) { return true }
    return false
  }


  return (
    <DialogBox close={close}>
      <div tw="flex flex-col">
        <section tw="flex">
          <label tw="w-full" htmlFor="nameField">Activity Name:</label>
          <input tw="w-full p-2" autoComplete="off" id="nameField" value={data.name} name="name" onChange={handleChange} />
        </section>
        <section tw="w-full flex flex-col">
          <label htmlFor="descField">Activity Description:</label>
          <textarea tw="p-4" rows={8} autoComplete="off" id="descField" value={data.description} name="description" onChange={handleChange} />
        </section>
      </div>
      <div tw="pt-8 flex gap-4">
        <CancelButton onClick={close}>Cancel</CancelButton>
        <ConfirmButton enabled={isConfirmEnabled()} onClick={() => {
          if (isConfirmEnabled()) {
            createActivity()
          }
        }}>Create</ConfirmButton>
      </div>
    </DialogBox>
  )
}

export default ProgrammingSchedule;
