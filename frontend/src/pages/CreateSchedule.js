import { useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { useState, useEffect } from "react";
import SelectActivities from "../components/SelectActivities";
import toTitleCase from "../toTitleCase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faForwardStep,
  faBackwardStep,
} from "@fortawesome/free-solid-svg-icons";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import ToggleSelector from "../components/Selector";
import SelectDayPeriod from "../components/SelectDayPeriod";

const dayAbbrev = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};


const CreateSchedulePage = () => {
  const [selectedDay, setSelectedDay] = useState(0);

  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const { weekNumber, cabin } = useParams();

  const [showControls, setShowControls] = useState(false);

  const [selectedCampers, setSelectedCampers] = useState([]);

  const handleOpenControls = () => {
    setShowControls(true);
  };
  const handleDialogSubmit = ({ day, period }) => {
    setSelectedDay(day);
    setSelectedPeriod(period);
  };
  // clear selection on change in week/cabin
  useEffect(() => {
    clearSelection();
  }, [weekNumber, cabin, selectedDay]);

  /** Add / remove selected camper and source id  to selected list.
   * @param {camperSession} camper The camper to add/remove from the selection list
   * @param {any} sourceId the source of the camper (unassigned, or activitySessionId)
   */
  const handleSelectCamper = (camper, sourceId) => {
    // check if is currently Selected
    if (
      selectedCampers.some(
        (c) => c.camper.camperSessionId === camper.camperSessionId
      )
    ) {
      setSelectedCampers((sc) =>
        sc.filter(
          (slc) => slc.camper.camperSessionId !== camper.camperSessionId
        )
      );
      return;
    }
    setSelectedCampers((s) => [...s, { camper, sourceId }]);
  };

  /** Clear the list of selectedCampers */
  const clearSelection = () => {
    setSelectedCampers([]);
  };

  const [week, setWeek] = useGetDataOnMount({
    url: `/api/weeks/${weekNumber}`,
    runOn: [weekNumber, cabin],
    initialState: {},
    useToken: true,
  });
  const [weekLoaded, setWeekLoaded] = useState(false);
  useEffect(() => {
    if (week.days) {
      setWeekLoaded(true);
    }
  }, [week]);
  const isTheLastPeriod = () => {
    if (weekLoaded) {
      return (
        selectedDay === week.days.length - 1 &&
        selectedPeriod === week.days[selectedDay].periods.length - 1
      );
    } else {
      return false;
    }
  };
  const selectNext = (numberToIncrement) => {
    const currentDayIndex = selectedDay;
    const currentPeriods = week.days[currentDayIndex].periods;
    const currentPeriodIndex = selectedPeriod;
    const nextPeriodIndex = currentPeriodIndex + numberToIncrement;
    const itIsTheLastPeriod = currentPeriods.length === nextPeriodIndex;

    if (!itIsTheLastPeriod && nextPeriodIndex >= 0) {
      setSelectedPeriod(nextPeriodIndex);
      return;
    } else {
      const nextIndex = currentDayIndex + numberToIncrement;
      const thereIsANextDay = week.days[nextIndex] !== undefined;
      const periodToChoose =
        numberToIncrement > 0 ? 0 : week.days[nextIndex].periods.length - 1;
      if (thereIsANextDay) {
        setSelectedDay(nextIndex);
        setSelectedPeriod(periodToChoose);
      }
    }
  };

  const getPeriod = () => week.days[selectedDay].periods[selectedPeriod];

  return (
    <Box width={1}>
    <Box component="nav"
    bgcolor="background.primary.light"
    py={0.75}
    position="sticky"
    top={72}
    zIndex={100}
    >
      <Stack
        direction="row"
        justifyContent="center"
        spacing={0.5}
        alignItems="baseline"
      >
        <Typography color="secondary" variant="h6">
          Cabin {`${toTitleCase(cabin)}`}
        </Typography>
        <Typography color="secondary" variant="subtitle1">
          Week {weekNumber}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <IconButton
          disabled={selectedDay === 0 && selectedPeriod === 0}
          onClick={() => {
            selectNext(-1);
            clearSelection();
          }}
        >
          <FontAwesomeIcon icon={faBackwardStep} />
        </IconButton>
        {week.days && (
          <Box>
            <Button onClick={handleOpenControls}>
              <Typography mr={0.5}>
                {dayAbbrev[week.days[selectedDay].name]}
              </Typography>
              <Typography fontWeight="bold">
                Act {week.days[selectedDay].periods[selectedPeriod].number}
              </Typography>
            </Button>
          </Box>
        )}
        <IconButton
          disabled={isTheLastPeriod()}
          onClick={() => {
            selectNext(1);
            clearSelection();
          }}
        >
          <FontAwesomeIcon icon={faForwardStep} />
        </IconButton>
      </Stack>
    </Box>
      {weekLoaded && (
        <>
          <Box width={1}>
            <SelectActivities
              width={1}
              handleSelectCamper={handleSelectCamper}
              selectedCampers={selectedCampers}
              clearSelection={clearSelection}
              cabinName={cabin}
              periodId={getPeriod().id}
            />
          </Box>
          <SelectDayPeriod
            onSubmit={handleDialogSubmit}
            open={showControls}
            onClose={() => {
              setShowControls(false);
            }}
            days={week.days}
            currentDay={selectedDay}
            currentPeriod={selectedPeriod}
            week={week}
            cabin={cabin}
          />
        </>
      )}
    </Box>
  );
};

export default CreateSchedulePage;
