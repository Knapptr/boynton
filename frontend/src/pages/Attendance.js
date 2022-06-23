import { useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
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

const AttendanceDisplay = () => {
  const { periodId } = useParams();
  const auth = useContext(UserContext);
  const [selected, setSelected] = useState(null);
  const [selectedCampers, setSelectedCampers] = useState([]);
  const [displayAll, setDisplayAll] = useState(true);
  const [displayModal, setDisplayModal] = useState(false);
  const [period, setPeriod, updatePeriod] = useGetDataOnMount({
    url: `/api/periods/${periodId}`,
    initialState: null,
    useToken: true,
  });
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
            <div tw="mb-6">
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
              setDisplayModal={setDisplayModal}
                />
      {displayModal && selectedCampers.length > 0 && (
        <ReassignModal
          selectedCampers={selectedCampers}
          period={period}
          setDisplayModal={setDisplayModal}
          updatePeriod={updatePeriod}
          camperSelection={camperSelection}
        />
      )}
    </>
  );
};
export default AttendanceDisplay;
