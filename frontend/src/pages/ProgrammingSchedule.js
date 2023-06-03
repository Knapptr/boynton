import { useCallback, useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { CancelButton, ConfirmButton, DialogBox, MenuSelector, PopOut } from "../components/styled";

const dayDictionary = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday"
}

const ProgrammingSchedule = () => {
  // get the list of weeks
  const [weeks] = useGetDataOnMount({
    url: "/api/weeks",
    initialState: [],
    useToken: true
  })


  const [selectedWeek, setSelectedWeek] = useState(undefined);

  const [selectedDay, setSelectedDay] = useState(undefined);

  const [selectedPeriod, setSelectedPeriod] = useState(undefined);

  const [displayPopout, setDisplayPopout] = useState(false);



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


  return (
    <>
      {selectedWeek && selectedDay && selectedPeriod &&
        <PopOut shouldDisplay={displayPopout} onClick={(e) => { showPopout(false) }}>
          <AddActivityBox week={selectedWeek} day={selectedDay} period={selectedPeriod} close={() => { showPopout(false) }} />
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

const AddActivityBox = ({ week, period, day, close }) => {
  // get list of activities
  const [activities] = useGetDataOnMount({
    url: "/api/activities",
    initialState: [],
    useToken: true
  })
  const [searchResults, setSearchResults] = useState([]);

  const [activityField, setActivityField] = useState("");

  const [selectedActivity, setSelectedActivity] = useState(null);

  const makeSelection = (e) => {
    e.preventDefault();
    const activity = activities.find(act => act.id === Number.parseInt(e.target.value));
    setSelectedActivity(activity);
  }

  const handleChange = (e) => {
    e.preventDefault();
    setActivityField(e.target.value);
  }

  const search = useCallback((string) => {
    const newResults = activities.filter(a => a.name.toLowerCase().includes(string.toLowerCase()))

    // Clear current selection if results dont include it
    if (newResults.every(act => act !== selectedActivity)) {
      setSelectedActivity(null);
    }
    //Set results
    setSearchResults(newResults);
  }, [activities, selectedActivity])

  //Search on loading activities
  useEffect(() => {
    search(activityField);
  }, [activities, activityField, search])

  return (
    <DialogBox close={() => { setSelectedActivity(null); setActivityField(""); close(); }} onClick={(e) => e.stopPropagation()} >
      <div>
        <h1>Week {week.number} <span tw="block text-xs font-thin">{week.title}</span></h1>
      </div>

      <h2 tw="bg-red-600"> Add activity to {dayDictionary[day.name]} Act. {period.number}</h2>
      <div tw="flex flex-col items-center sm:justify-center h-full py-8 w-full">
        <div tw="flex flex-col md:flex-row flex-wrap gap-4 w-full" >
          <div id="searchArea" tw="border-r pr-4 flex flex-col w-full sm:w-1/3">
            <div>
              <div tw="w-full flex">
                <label htmlFor="activityField">Search</label>
                <input tw="px-2 py-1" autoComplete="off" id="activityField" placeholder="Activity Name" value={activityField} onChange={handleChange} />
              </div>
              <select id="activity-matches" tw="w-full" size={8} onChange={makeSelection}>
                {searchResults.map(act => <option tw="text-right odd:bg-cyan-50" key={`act-option-${act.id}`} value={act.id}>{act.name}</option>)}
              </select>
            </div>
          </div>
          {selectedActivity &&
            <div id="infoArea" tw="w-full sm:w-1/2">
              <h1 tw="bg-green-400 "><span tw="text-sm font-light">Activity: </span><span tw="font-bold text-lg">{selectedActivity.name}</span>
              </h1>
              <div tw="text-left ">
                <h2 tw="font-light text-sm">Description:</h2>
                <p>{selectedActivity.description}</p>
              </div>
            </div>
          }
        </div>
        <footer tw="py-4">
        </footer>
        <div tw="absolute bottom-4  gap-4">
          <CancelButton>Nevermind</CancelButton> <ConfirmButton enabled={selectedActivity !== null}>Add</ConfirmButton></div>
      </div>
    </DialogBox >)
}
export default ProgrammingSchedule;
