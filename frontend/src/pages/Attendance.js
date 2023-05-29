import { useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import UserContext from "../components/UserContext";
import ReassignModal from "../components/ReassignModal";
import ActivityAttendance from "../components/ActivityAttendance";
import ActivitySelectors from "../components/ActivitySelectors";
import ReassignmentSelectionDialog from "../components/AttendanceReassignDialog";
import fetchWithToken from "../fetchWithToken";
import AttendanceSearch from "../components/AttendanceSearch";

const refreshRate = 1000 * 2;
const cancelIntervalTime = 1000 * 60 * 8;

const AttendanceDisplay = () => {
  const { periodId } = useParams();
  const auth = useContext(UserContext);
  const [selected, setSelected] = useState(null);
  const [selectedCampers, setSelectedCampers] = useState([]);
  const [displayAll, setDisplayAll] = useState(true);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [period, setPeriod] = useState(undefined);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const getPeriod = useCallback(async () => {
    const url = `/api/periods/${periodId}`;
    const data = await fetchWithToken(url, {}, auth);
    const periodJson = await data.json();
    setPeriod(periodJson);
  }, [periodId, auth]);

  // User input boolean value meaans nothing, in is just a switch to indicate that input has happened
  const [userInput, setUserInput] = useState(false);
  // track user input and reset timer on every attendance change

  const startTimer = useCallback(() => {
    // cancel old timer
    if (intervalRef.current !== null && timeoutRef.current !== null) {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
      // start new timer
      intervalRef.current = setInterval(() => {
        getPeriod();
      }, refreshRate);

      timeoutRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
      }, cancelIntervalTime)
    } else {
      intervalRef.current = setInterval(() => {
        getPeriod();
      }, refreshRate)

      timeoutRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
      }, cancelIntervalTime)
    }
  }, [getPeriod])

  useEffect(() => {
    startTimer()
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    }
  }, [startTimer, userInput]);

  const openSearchModal = () => {
    setShowSearchModal(true);
  };
  const closeSearchModal = () => {
    setShowSearchModal(false);
  };
  const selectSpecific = (index) => {
    setSelected(index);
    setDisplayAll(false);
  };
  const selectAll = () => {
    setSelected(null);
    setDisplayAll(true);
  };
  const camperSelection = {
    select(camper) {
      setSelectedCampers((c) => [...c, camper]);
    },
    deselect(camper) {
      const camperIndex = selectedCampers.findIndex((c) => c.id === camper.id);
      const updatedCampers = [...selectedCampers];
      updatedCampers.splice(camperIndex, 1);
      setSelectedCampers(updatedCampers);
    },
    isSelected(camper) {
      return selectedCampers.find((c) => c.sessionId === camper.sessionId);
    },
    clear() {
      setSelectedCampers([]);
    },
    async reassign(camper, activity) {
      console.log({ camper, activity })
      const url = `/api/activities/${activity.id}/campers`;
      const options = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          camperWeekId: camper.weekId,
          periodId: period.id,
        }),
      };
      await fetchWithToken(url, options, auth);
    },
  };
  const toggleHere = (sessionId, camperSessionId) => {
    setUserInput(i => !i);
    const updatedActivities = [...period.activities];
    const activityIndex = updatedActivities.findIndex(
      (a) => a.sessionId === sessionId
    );
    const updatedActivity = { ...updatedActivities[activityIndex] };
    const updatedCampers = [...updatedActivity.campers];
    const updatedCamperIndex = updatedCampers.findIndex(c => c.sessionId === camperSessionId);
    const updatedCamper = { ...updatedCampers[updatedCamperIndex] };
    console.log({ updatedCamper });
    updatedCamper.isPresent = !updatedCamper.isPresent;
    updatedCampers.splice(updatedCamperIndex, 1, updatedCamper);
    updatedActivity.campers = updatedCampers;
    updatedActivities.splice(activityIndex, 1, updatedActivity);
    console.log({ updatedActivities });
    setPeriod((p) => ({ ...p, activities: updatedActivities }));
  };

  const renderAllActivities = () => {
    return period.activities.map((a, aIndex) => (
      <ActivityAttendance
        key={`act-atten-${a.sessionId}`}
        camperSelection={camperSelection}
        activity={a}
        activityIndex={aIndex}
        toggleHere={toggleHere}
      />
    ));
  };

  const renderSelectedActivity = () => {
    return (
      <ActivityAttendance
        camperSelection={camperSelection}
        activity={period.activities[selected]}
        toggleHere={toggleHere}
      />
    );
  };

  return (
    <>
      <div tw="mb-32">
        {period && (
          <>
            <AttendanceSearch
              closeSearchModal={closeSearchModal}
              shouldDisplay={showSearchModal}
              periodNumber={period.number}
              activities={period.activities}
            />
            <div tw="mb-6">
              <ActivitySelectors
                selectAll={selectAll}
                openSearchModal={openSearchModal}
                selectSpecific={selectSpecific}
                period={period}
                displayAll={displayAll}
                selected={selected}
              />
            </div>
          </>
        )}
        {period && displayAll && renderAllActivities()}
        {period && !displayAll && renderSelectedActivity()}
      </div>
      <ReassignmentSelectionDialog
        selectedCampers={selectedCampers}
        camperSelection={camperSelection}
        setDisplayModal={setShowReassignModal}
      />
      {showReassignModal && selectedCampers.length > 0 && (
        <ReassignModal
          selectedCampers={selectedCampers}
          period={period}
          setDisplayModal={setShowReassignModal}
          updatePeriod={getPeriod}
          camperSelection={camperSelection}
        />
      )}
    </>
  );
};
export default AttendanceDisplay;
