import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import { MenuSelector } from "../components/styled";
import toTitleCase from "../toTitleCase";
import tw, { styled } from 'twin.macro';
import 'styled-components/macro'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  const location = useLocation();
  console.log({ attendanceLocationMatch: location.pathname === "/schedule/attendance" });
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
  }, [selected, schedule, navigate]);

  const [showAccordion, setShowAccordion] = useState(false);

  const handleAccordionChange = (e, state) => {
    setShowAccordion(state);
  }
  return (
    <>
      <h1 tw="text-xl font-bold">Attendance</h1>
      <Accordion tw="mb-6 shadow-none py-2 px-1 rounded bg-green-200" expanded={location.pathname === "/schedule/attendance" || showAccordion} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={location.pathname === "/schedule/attendance" ? <></> : <ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <p tw="text-center w-full font-bold">Schedule Selection</p>
        </AccordionSummary>
        <AccordionDetails>
          <div tw="flex flex-col items-center gap-2">
            <div tw="flex gap-2 items-center">
              <h2>Week</h2>
              <ul tw="flex justify-center gap-1" >
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
            </div>
            {selected.week !== "none" &&
              (
                <>

                  <div tw="flex gap-2 items-center">
                    <h2 tw="inline">Day</h2>
                    <ul tw="flex gap-1 justify-center">
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
                  </div>
                </>
              )}
            {selected.day !== "none" &&
              (
                <>
                  <div tw="flex gap-2 justify-center">
                    <h2>Period</h2>
                    <ul tw="flex justify-center gap-2">
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
                  </div>
                </>
              )}
          </div>
        </AccordionDetails>
      </Accordion>
      <Outlet />
    </>
  );
};

export default AttendanceIndex;
