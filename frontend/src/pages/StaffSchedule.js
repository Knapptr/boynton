import { useContext, useState, useEffect, useCallback } from "react";
import { MenuSelector } from "../components/styled";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw from 'twin.macro';
import 'styled-components/macro';

const StaffSchedule = () => {
  const auth = useContext(UserContext);

  const [weeks, setWeeks] = useState([]);

  const [selectedWeek, setSelectedWeek] = useState(null);

  const [selectedDay, setSelectedDay] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState(null);


  const selectWeek = (week) => {
    setSelectedWeek(week);
  }

  const selectDay = (day) => {
    setSelectedPeriod(null);
    setSelectedDay(day);
  }

  const selectPeriod = (period) => {
    setSelectedPeriod(period);
  }


  // get all weeks
  useEffect(() => {
    const getWeeks = async () => {
      const weeks = await fetchWithToken("/api/weeks", {}, auth);
      const data = await weeks.json();
      setWeeks(data)
    }
    getWeeks();
  }, [])

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
      {/* This will need a query that looks for all staff who have not been assigned any activities this period AND have not had 2 activities assigned on the day */}
      <h1>Available Staff</h1>
      {/* Acts go Here */}
      <h1>Activities</h1>
      {selectedPeriod !== null && <ActivityStaffList selectedPeriod={selectedPeriod} />}
    </>
  )
}

const ActivityStaffList = ({ selectedPeriod }) => {
  const auth = useContext(UserContext);


  const [activities, setActivities] = useState([]);
  //
  //** Get staff for selected period
  const fetchActivities = useCallback(async () => {
    const result = await fetchWithToken(`/api/periods/${selectedPeriod.id}`, {}, auth)
    const periodData = await result.json();
    setActivities(periodData.activities);
  }, [selectedPeriod, auth])

  /** Set staff on mount */
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities])

  return (
    <ul>
      {activities.map(activity => <li>{activity.name}</li>)}
    </ul>
  )
}

export default StaffSchedule
