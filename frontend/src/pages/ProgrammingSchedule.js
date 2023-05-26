import { useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector, PopOut } from "../components/styled";

const ProgrammingSchedule = () => {
  // get the list of weeks
  const [weeks] = useGetDataOnMount({
    url: "api/weeks",
    initialState: [],
    useToken: true
  })

  // get list of activities
  const [activities] = useGetDataOnMount({
    url: "api/activities",
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

  const dayDictionary = {
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday"
  }

  return (
    <>
      <PopOut shouldDisplay={displayPopout} onClick={(e) => { showPopout(false) }}>
        <div onClick={(e) => e.stopPropagation()} tw=" relative flex flex-col justify-center border bg-stone-300 max-w-md shadow-2xl rounded-lg px-4 py-2 w-10/12">
          <h1>Week {selectedWeek?.number} <span tw="block text-xs font-thin">{selectedWeek?.title}</span></h1>

          <h2 tw="bg-red-600"> {selectedPeriod !== undefined && `Add activity to ${dayDictionary[selectedDay.name]} Act. ${selectedPeriod.number}`}</h2>
          <div>
            <ul tw="overflow-y-auto ">
              {activities.map(act => <li>{act.name}</li>)}
            </ul>
          </div>

        </div>
      </PopOut>
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
      < ul tw="flex justify-center sm:justify-evenly gap-2"> {selectedWeek !== undefined && selectedWeek.days.map(day => {
        return <li onClick={(e) => { e.stopPropagation(); setSelectedDay(day) }}>
          <MenuSelector isSelected={selectedDay && day.id === selectedDay.id}> <h3>{day.name}</h3></MenuSelector></li>
      })
      }
      </ul >
      {/* PERIODS */}
      <ul tw="grid grid-cols-2 sm:flex justify-evenly gap-2"> {selectedDay !== undefined && selectedDay.periods.map(period => {
        return <li ><span>Act {period.number}</span>
          <ul>
            <button onClick={() => { showPopout(true); selectPeriod(period) }} tw="bg-green-200 rounded shadow-sm border border-black w-full text-xs px-1">+ Add Activity</button>
            {period.activities.map(activity => <li>{activity.name}</li>)}
          </ul>
        </li>
      })}
      </ul>
    </>
  )

}

export default ProgrammingSchedule;
