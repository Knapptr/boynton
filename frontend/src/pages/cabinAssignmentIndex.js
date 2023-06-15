import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useWeeks from "../hooks/useWeeks";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";


const AREAS = ["BA", "GA"];

const CabinAssignmentIndex = () => {
  const navigate = useNavigate();
  const { selectedWeek, WeekSelection } = useWeeks();
  const [selectedArea, setSelectedArea] = useState(null);

  const handleAreaSelect = (e, value) => {
    setSelectedArea(value);
  }

  useEffect(() => {
    if (selectedWeek() !== null && selectedArea !== null) {
      navigate(`/cabins/assignment/${selectedArea}/${selectedWeek().number}`)
    }
  }, [navigate, selectedArea, selectedWeek])

  return (
    <>
      <div tw="mx-auto w-1/2">
        <WeekSelection />
        <header><h1>Select Area</h1></header>
        <ToggleButtonGroup onChange={handleAreaSelect} value={selectedArea}>
          {AREAS.map(area => <ToggleButton value={area} key={`select-${area}`}>{area}</ToggleButton>)}
        </ToggleButtonGroup>
      </div>
    </>
  );
};

export default CabinAssignmentIndex;
