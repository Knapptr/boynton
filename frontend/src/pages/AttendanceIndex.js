import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import { MenuSelector } from "../components/styled";
import toTitleCase from "../toTitleCase";
import tw,{styled} from 'twin.macro';
import 'styled-components/macro'

const allHaveBeenSelected = (selected) => {
  if (
    selected.week !== "none" &&
    selected.day !== "none" &&
    selected.period !== "none"
  ) {
    return true;
  }
  return false;
};

const AttendanceIndex = () => {
  const [schedule, setSchedule] = useGetDataOnMount({
    url: "/api/weeks",
    useToken: true,
    initialState: [],
  });
  const navigate = useNavigate();
  const [selected, setSelected] = useState({
    week: "none",
    day: "none",
    period: "none",
    activity: "none",
  });
  const selectWeek = (week) => {
    setSelected({ ...selected, week });
  };
  const selectDay = (day) => {
    setSelected({ ...selected, day });
  };
  const selectPeriod = (period) => {
    setSelected({ ...selected, period });
  };
  useEffect(() => {
    if (selected.period !== "none") {
      const selectedPeriodId =
        schedule[selected.week].days[selected.day].periods[selected.period].id;
      navigate(`/schedule/attendance/${selectedPeriodId}`);
    }
  }, [selected,schedule,navigate]);

  return (
    <>
      <h1>Select Week</h1>
      <ul tw="flex justify-center gap-3">
        {schedule.map((week, weekIndex) => (
          <MenuSelector
            tw="px-4"
            onClick={() => selectWeek(weekIndex)}
            isSelected={selected.week === weekIndex}
          >
            <button>{week.number}</button>
          </MenuSelector>
        ))}
      </ul>
    {selected.week !== "none" &&
        (
          <>
            <h1>Select Day</h1>
              <ul tw="flex gap-3 justify-center">
                {
                schedule[selected.week].days.map((day, dayIndex) => (
                <MenuSelector
                  isSelected={selected.day === dayIndex}
                  onClick={() => {
                    selectDay(dayIndex);
                  }}
                >
                  <button>{toTitleCase(day.name)}</button>
                </MenuSelector>
                ))}
    </ul>
              </>
)}
    {selected.day !== "none" &&
        (
        <>
        <h1>Select Period</h1>
          <ul tw="flex justify-center gap-3">
        {
          schedule[selected.week].days[selected.day].periods.map(
            (period, periodIndex) => (
              <MenuSelector
          onClick={() => {
            selectPeriod(periodIndex);
                }}
                isSelected={periodIndex === selected.period}
              >
                <button>{period.number}</button>
              </MenuSelector>
            ))
        }
          </ul>
          </>
      )}
    </>
  );
};

export default AttendanceIndex;
