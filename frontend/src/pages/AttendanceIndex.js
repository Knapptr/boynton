import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import { AssignmentHeader, MenuSelector } from "../components/styled";
import toTitleCase from "../toTitleCase";
import tw, { styled } from 'twin.macro';
import 'styled-components/macro'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import getDayName from "../utils/getDayname";
import useWeeks from "../hooks/useWeeks";


const SelectionHeader = ({ fields }) => {

  return (fields !== null ? <>
    <div tw="mx-auto">
      <h1 tw="font-bold text-xl">Week {fields.weekNumber} - {getDayName(fields.dayName)} </h1>
      <h2 tw="font-bold text-2xl">Activity Period {fields.periodNumber}</h2>
    </div></> :

    <p tw="text-center w-full font-bold">Schedule Selection</p>
  )
}

const AttendanceIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [headerFields, setHeaderFields] = useState(null);

  const { selectedWeek, clearSelection, selectedDay, selectedPeriod, WeekSelection, DaySelection, PeriodSelection } = useWeeks();




  useEffect(() => {
    if (selectedPeriod() !== null) {
      setShowAccordion(false);
      navigate(`/schedule/attendance/${selectedPeriod().id}`);
      setHeaderFields({
        weekNumber: selectedWeek().number,
        dayName: selectedDay().name,
        periodNumber: selectedPeriod().number
      })
      clearSelection();

    }
  }, [clearSelection, selectedDay, selectedWeek, selectedPeriod, navigate]);

  const [showAccordion, setShowAccordion] = useState(false);

  const handleAccordionChange = (e, state) => {
    setShowAccordion(state);
  }
  return (
    <>
      <h1 tw="text-xl font-bold">Attendance</h1>
      <Accordion tw="mb-6 shadow-none py-2 px-1 rounded bg-green-200 w-8/12 " expanded={location.pathname === "/schedule/attendance" || showAccordion} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={location.pathname === "/schedule/attendance" ? <></> : <ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <SelectionHeader fields={headerFields} />
        </AccordionSummary>
        <AccordionDetails>
          <WeekSelection />
          <DaySelection />
          <PeriodSelection />
        </AccordionDetails>
      </Accordion>
      <Outlet context={{ setHeaderFields }} />
    </>
  );
};

export default AttendanceIndex;
