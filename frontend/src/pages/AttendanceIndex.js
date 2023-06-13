import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import { AssignmentHeader, MenuSelector } from "../components/styled";
import toTitleCase from "../toTitleCase";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import getDayName from "../utils/getDayname";
import useWeeks from "../hooks/useWeeks";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";

const SelectionHeader = ({ fields }) => {
  return (
    <>
      <Stack width={1} direction="column" alignItems="center" justifyContent="center" >
    {fields!==null?(
      <>
        <Typography variant="body1">
      {fields.weekTitle} - {getDayName(fields.dayName)}{" "}
        </Typography>
        <Typography variant="h6">Activity Period {fields.periodNumber}</Typography>
      </>
    ):
    (<Typography >Schedule Selection</Typography>)
    }
      </Stack>
    </>
  );
};

const AttendanceIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [headerFields, setHeaderFields] = useState(null);

  const {
    selectedWeek,
    clearSelection,
    selectedDay,
    selectedPeriod,
    WeekSelection,
    DaySelection,
    PeriodSelection,
  } = useWeeks();

  useEffect(() => {
    if (selectedPeriod() !== null) {
      setShowAccordion(false);
      navigate(`/schedule/attendance/${selectedPeriod().id}`);
      setHeaderFields({
        weekNumber: selectedWeek().number,
        weekTitle: selectedWeek().title,
        dayName: selectedDay().name,
        periodNumber: selectedPeriod().number,
      });
      clearSelection();
    }
  }, [clearSelection, selectedDay, selectedWeek, selectedPeriod, navigate]);

  const [showAccordion, setShowAccordion] = useState(false);

  const handleAccordionChange = (e, state) => {
    setShowAccordion(state);
  };
  return (
    <>
    <Box width={1}>
      <Accordion
    
        expanded={location.pathname === "/schedule/attendance" || showAccordion}
        onChange={handleAccordionChange}
    sx={{marginBottom: 2}}
      >
        <AccordionSummary
          expandIcon={
            location.pathname === "/schedule/attendance" ? (
              <></>
            ) : (
              <ExpandMoreIcon />
            )
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <SelectionHeader fields={headerFields} />
        </AccordionSummary>
        <AccordionDetails
    sx={{py:0}}
    >
          <WeekSelection />
          <DaySelection />
          <PeriodSelection />
        </AccordionDetails>
      </Accordion>
    </Box>
      <Outlet context={{ setHeaderFields,hasHeaderFields: headerFields !== null }} />
    </>
  );
};

export default AttendanceIndex;
