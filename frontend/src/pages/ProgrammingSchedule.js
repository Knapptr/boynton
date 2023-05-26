import { useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "../components/styled";

const ProgrammingSchedule = () => {
  // get the list of weeks
  const [weeks] = useGetDataOnMount({
    url: "api/weeks",
    initialState: [],
    useToken: true
  })

  const [currentDays, setCurrentDays] = useState(undefined);

  const [selectedWeek, setSelectedWeek] = useState(undefined);

  const [selectedDay, setSelectedDay] = useState(undefined);

  /** Select a week */
  const selectWeek = (week) => {
    setSelectedWeek(week);
    setSelectedDay(undefined);
  }

  /** Select a day */
  const selectDay = (day) => {
    setSelectedDay(day);
  }

  return (
    <>
      <ul tw="flex justify-evenly flex-wrap">
        {weeks.map((week) => {
          return (
            <li onClick={() => { selectWeek(week) }} key={`week-${week.number}`}>
              <MenuSelector isSelected={selectedWeek && week.number === selectedWeek.number} >
                <h2>Week {week.number} </h2><span tw="text-xs font-thin">{week.title}</span>
              </MenuSelector>
            </li>
          )
        })}
      </ul>
      < ul tw="flex justify-evenly"> {selectedWeek !== undefined && selectedWeek.days.map(day => {
        return <li onClick={(e) => { e.stopPropagation(); setSelectedDay(day) }}>
          <MenuSelector isSelected={selectedDay && day.id === selectedDay.id}> <h3>{day.name}</h3></MenuSelector></li>
      })
      }
      </ul >
      {/* PERIODS */}
      <ul tw="flex justify-evenly"> {selectedDay !== undefined && selectedDay.periods.map(period => {
        return <li ><span>Act {period.number}</span>
          <ul>
            <button tw="bg-green-200 rounded shadow-sm border border-black w-full text-xs px-1">+ Add Activity</button>
            {period.activities.map(activity => <li>{activity.name}</li>)}
          </ul>
        </li>
      })}
      </ul>
    </>
  )

}

export default ProgrammingSchedule;
