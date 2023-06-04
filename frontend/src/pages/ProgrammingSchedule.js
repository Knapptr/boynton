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
  // get the list of weeks
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(undefined);

  const getWeeks = useCallback(async () => {
    const response = await fetchWithToken("/api/weeks", {}, auth)
    if (!response || response.status !== 200) { console.log("Something went wrong!"); return; }
    const data = await response.json();
    setWeeks(data);

  }, [auth])


  useEffect(() => {
    getWeeks();
  }, [getWeeks])


  const addActivitySession = async (activityId, periodId) => {
    console.log("adding activity");
    const url = "/api/activity-sessions"
    const data = { activityId, periodId };
    const opts = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    }

    const response = await fetchWithToken(url, opts, auth);
    const setData = await response.json();
    return setData
  }


  /* NOTE TO SELF
      * Refactor the selctions to use indicies 
      * such that the selected day/week/period
      * remain selected when the state of the week
      * is updated
  */

  const [selectedDay, setSelectedDay] = useState(undefined);

  const [selectedPeriod, setSelectedPeriod] = useState(undefined);

  const [displayAddPopout, setDisplayPopout] = useState(false);

  const [activities, _, updateActivities] = useGetDataOnMount({
    url: "/api/activities",
    initialState: [],
    useToken: true
  })

  /** Select a week */
  const selectWeek = (week) => {
    setSelectedWeek(week);
    setSelectedDay(undefined);
  }

  /** Select a day */
  const selectDay = (day) => {
    setSelectedDay(day);
  }

  /** Display the add activity popout 
    * @param {boolean} state New State*/
  const showPopout = (state) => {
    setDisplayPopout(state)
  }

  /** Select a period to add to
    * @param {period} period period to select
    */
  const selectPeriod = (period) => {
    setSelectedPeriod(period);
  }

  const [createActivityData, setCreateActivityData] = useState({ showWindow: false, name: "", description: "", periodId: null });

  const closeCreatePopOut = () => {
    setCreateActivityData(d => ({ ...d, showWindow: false }));
  }
  /** Begin the creation of an activity, display a popup with relevant fields.
    * @param periodId {periodId} the period for which to instantiate a session of the newly created activity */
  const beginCreateActivity = (periodId) => {
    // close the select activity window
    setDisplayPopout(false);
    setCreateActivityData({ showWindow: true, name: "", description: "", periodId });
  }

  /** things to do after creating activity and activity session with activity creator
    */
  const afterActivityCreation = async () => {
    await getWeeks();
    closeCreatePopOut();
    updateActivities();
  }

  return (
    <>
      {createActivityData.showWindow &&
        <PopOut shouldDisplay={true} onClick={closeCreatePopOut}>
          <CreateActivity data={createActivityData} setData={setCreateActivityData} close={closeCreatePopOut} addActivitySession={addActivitySession} afterCreation={afterActivityCreation} />
        </PopOut>
      }
      {selectedWeek && selectedDay && selectedPeriod && displayAddPopout &&
        <PopOut shouldDisplay={true} onClick={(e) => { showPopout(false) }}>
          <AddActivityBox activities={activities} addActivitySession={addActivitySession} week={selectedWeek} day={selectedDay} period={selectedPeriod} close={() => { showPopout(false) }} createActivity={beginCreateActivity} updateWeeks={getWeeks} />
        </PopOut>
      }
      <ul tw="flex justify-center sm:justify-evenly gap-2">
        {weeks.map((week) => {
          return (
            <MenuSelector key={`week-select-${week.number}`} onClick={() => { selectWeek(week) }} isSelected={selectedWeek && week.number === selectedWeek.number} >
              <h2><span tw="hidden  sm:block">Week</span> {week.number} </h2><span tw="hidden sm:block text-xs font-thin">{week.title}</span>
            </MenuSelector>
          )
        })}
      </ul>
      < ul tw="flex justify-center sm:justify-evenly gap-2"> {selectedWeek !== undefined && selectedWeek.days.map(day =>
        <MenuSelector key={`day-select-${day.id}`} onClick={(e) => { e.stopPropagation(); setSelectedDay(day) }} isSelected={selectedDay && day.id === selectedDay.id}> <h3>{day.name}</h3></MenuSelector>
      )
      }
      </ul >
      {/* PERIODS */}
      <ul tw="grid grid-cols-2 sm:flex justify-evenly gap-2"> {selectedDay !== undefined && selectedDay.periods.map(period => {
        return <li key={`period-select-${period.id}`} ><span>Act {period.number}</span>
          <ul>
            <button onClick={() => { showPopout(true); selectPeriod(period) }} tw="bg-green-200 rounded shadow-sm border border-black w-full text-xs px-1">+ Add Activity</button>
            {period.activities.map(activity => <li key={`activity-list-${activity.id}`}>{activity.name}</li>)}
          </ul>
        </li>
      })}
      </ul>
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
  * @param props.updateWeeks called after creating session
  */
const AddActivityBox = ({ week, period, day, close, addActivitySession, createActivity, activities, updateWeeks }) => {
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
      console.log({ actSessResponse });
      await updateWeeks()
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
    if (result.status === 400) { console.log("Not created"); return; }
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
