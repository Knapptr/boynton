import { useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector, PopOut } from "../components/styled";
import UserContext from "../components/UserContext";
import ReassignModal from "../components/ReassignModal";
import ActivityAttendance from "../components/ActivityAttendance";
import ActivitySelectors from "../components/ActivitySelectors";
import ReassignmentSelectionDialog from "../components/AttendanceReassignDialog";
import fetchWithToken from "../fetchWithToken";
import AttendanceSearch from "../components/AttendanceSearch";

const refreshRate = 1000 * 10;
const cancelIntervalTime = 1000 * 60 * 8;

const AttendanceDisplay = () => {
  const { periodId } = useParams();
  const auth = useContext(UserContext);
  const [selected, setSelected] = useState(null);
  const [selectedCampers, setSelectedCampers] = useState([]);
  const [displayAll, setDisplayAll] = useState(true);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [period, setPeriod] = useState(undefined);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const getPeriod = useCallback(async () => {
    const url = `/api/periods/${periodId}`;
    const data = await fetchWithToken(url, {}, auth);
    const periodJson = await data.json();
    setPeriod(periodJson);
  }, [periodId, auth]);

  useEffect(() => {
    getPeriod();
    intervalRef.current = setInterval(() => {
      getPeriod();
    }, refreshRate);
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
    }, cancelIntervalTime);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [periodId, getPeriod]);

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
      return selectedCampers.find((c) => c.id === camper.id);
    },
    clear() {
      setSelectedCampers([]);
    },
    async reassign(camper, activity) {
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
  const toggleHere = (activityId, camperIndex) => {
    const updatedActivities = [...period.activities];
    const activityIndex = updatedActivities.findIndex(
      (a) => a.id === activityId
    );
    const updatedActivity = { ...updatedActivities[activityIndex] };
    const updatedCampers = [...updatedActivity.campers];
    const updatedCamper = { ...updatedCampers[camperIndex] };
    updatedCamper.isPresent = !updatedCamper.isPresent;
    updatedCampers.splice(camperIndex, 1, updatedCamper);
    updatedActivity.campers = updatedCampers;
    updatedActivities.splice(activityIndex, 1, updatedActivity);
    setPeriod((p) => ({ ...p, activities: updatedActivities }));
  };

  const renderAllActivities = () => {
    return period.activities.map((a, aIndex) => (
      <ActivityAttendance
        key={`act-atten-${aIndex}`}
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
              <button tw="bg-blue-200" onClick={openSearchModal}>
                Search
              </button>
              <ActivitySelectors
                selectAll={selectAll}
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
