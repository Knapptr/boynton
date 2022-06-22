import { useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector, PopOut } from "../components/styled";
import fetchWithToken from "../fetchWithToken";
import UserContext from "../components/UserContext";

const SummaryBanner = styled.div(({ allHere }) => [
  tw`text-sm flex justify-between  py-px font-bold px-2 bg-red-500 text-white transition-colors border border-b-black`,
  allHere && tw`bg-green-500`,
]);

const AttendantWrapper = styled.li(({ isChecked, isSelected }) => [
  tw`bg-yellow-300 font-bold py-3 select-none transition-colors border border-white`,
  isChecked && tw`bg-green-400`,
  isSelected && tw`brightness-75 ring-4 ring-inset ring-orange-500`,
]);
const AttendanceName = styled.p(({ isPresent }) => [
  isPresent && tw`line-through`,
]);
const AttendanceButton = styled.button(({ isPresent }) => [
  tw`px-2 border shadow-xl bg-gray-200 ml-auto rounded-lg`,
  isPresent && tw`no-underline`,
]);
const CamperAttendant = ({
  camperIndex,
  camper,
  activity,
  activityIndex,
  toggleIsPresent,
  camperSelection,
}) => {
  return (
    <AttendantWrapper
      isChecked={camper.isPresent}
      isSelected={camperSelection.isSelected(camper)}
    >
      <div tw="flex mx-auto px-8 md:px-32">
        <div tw="mr-auto">
          <button
            onClick={() => {
              if (camperSelection.isSelected(camper)) {
                camperSelection.deselect(camper);
                return;
              }
              camperSelection.select(camper);
            }}
          >
            {camperSelection.isSelected(camper) ? "Deselect" : "Select"}
          </button>
        </div>
        <AttendanceName isPresent={camper.isPresent}>
          {camper.firstName} {camper.lastName}
        </AttendanceName>
        <AttendanceButton
          isPresent={camper.isPresent}
          onClick={async () => {
            toggleIsPresent(activity.id, camperIndex);
            const options = {
              method: "PUT",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${localStorage.getItem("bearerToken")}`,
              },
              body: JSON.stringify({ isPresent: !camper.isPresent }),
            };
            await fetch(
              `/api/activities/${activity.id}/campers/${camper.id}`,
              options
            );
          }}
        >
          {!camper.isPresent && "Not"} Here
        </AttendanceButton>
      </div>
    </AttendantWrapper>
  );
};
const Activity = ({ activity, activityIndex, toggleHere, camperSelection }) => {
  const getUnaccountedFor = () => {
    const unaccounted = activity.campers.filter(
      (camper) => camper.isPresent === false
    );
    return unaccounted.length;
  };
  return (
    <>
      <li tw="relative ">
        <header tw="mb-4 sticky top-0">
          <h2 tw="py-3 bg-lightBlue-500 text-xl font-bold text-white ">
            {activity.name}
          </h2>
          <SummaryBanner allHere={getUnaccountedFor() === 0}>
            <span>{activity.campers.length} campers total</span>
            {getUnaccountedFor() ? (
              <span>{getUnaccountedFor()} unaccounted for</span>
            ) : (
              <span>"All Here!"</span>
            )}
          </SummaryBanner>
        </header>
        <ul tw="w-11/12 mx-auto">
          {activity.campers.length === 0 ? (
            <li>no campers</li>
          ) : (
            activity.campers
              .sort((camper1, camper2) => {
                return camper1.lastName > camper2.lastName ? 1 : -1;
              })
              .map((camper, camperIndex) => (
                <CamperAttendant
                  camperSelection={camperSelection}
                  key={`camper-${activity.name}-${camperIndex}`}
                  toggleIsPresent={toggleHere}
                  camperIndex={camperIndex}
                  camper={camper}
                  activityIndex={activityIndex}
                  activity={activity}
                ></CamperAttendant>
              ))
          )}
        </ul>
      </li>
    </>
  );
};

const ActivitySelector = () => {
  const { periodId } = useParams();
  const auth = useContext(UserContext);
  const [selected, setSelected] = useState("none");
  const [selectedCampers, setSelectedCampers] = useState([]);
  const [displayAll, setDisplayAll] = useState(true);
  const [displayModal, setDisplayModal] = useState(false);
  const [reassignmentOption, setReassignmentOption] = useState(null);
  const [period, setPeriod, updatePeriod] = useGetDataOnMount({
    url: `/api/periods/${periodId}`,
    initialState: null,
    useToken: true,
  });
  const selectSpecific = (id) => {
    setSelected(id);
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
      const response = await fetchWithToken(url, options, auth);
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
  return (
    <>
      {displayModal && selectedCampers.length > 0 && (
        <PopOut
          onClick={(e) => {
            setDisplayModal(false);
          }}
          shouldDisplay={true}
        >
          <div
            tw="bg-white shadow rounded py-4 px-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={()=>setDisplayModal(false)} tw="top-0 right-1 absolute">X</button>
            <h2 tw="bg-orange-400 p-2 rounded my-2">Reassign {selectedCampers.length} camper(s)?</h2>
            <div tw="flex flex-col justify-center items-center">
              <ul tw="flex flex-col gap-1 my-2">
                {selectedCampers.map((c) => (
                  <li tw="bg-green-300 shadow border">
                    {c.firstName} {c.lastName}
                  </li>
                ))}
              </ul>
              <label htmlFor="reassignTo">Reassign To:</label>
              <select
                name="reassignTo"
                id="reassignTo"
                defaultValue={"default"}
                value={reassignmentOption}
                onChange={(e) => {
                  setReassignmentOption(e.target.value);
                }}
              >
                <option disabled value={"default"}>
                  Select an option
                </option>
                {period.activities.map((a) => (
                  <option value={a.id}>{a.name}</option>
                ))}
              </select>
              <button
                tw="bg-green-600 px-3 py-2 rounded shadow mb-2 mt-6"
                onClick={async () => {
                  const activity = period.activities.find(
                    (a) => a.id === Number.parseInt(reassignmentOption)
                  );
                  await Promise.all(
                    selectedCampers.map((c) =>
                      camperSelection.reassign(c, activity)
                    )
                  );
                  updatePeriod();
                  camperSelection.clear();
                  setDisplayModal(false);
                }}
              >
                Reassign
              </button>
            </div>
          </div>
        </PopOut>
      )}

      <ul tw="flex gap-1 flex-col justify-center">
        {period && (
          <>
            <li>
              <ul tw="flex justify-center gap-2 flex-wrap">
                <MenuSelector  onClick={selectAll} isSelected={displayAll}>
                  <button>All</button>
                </MenuSelector>
                {period.activities.map((act, index) => (
                  <MenuSelector
                    onClick={() => {
                      selectSpecific(act.id);
                    }}
                    isSelected={act.id === selected}
                    key={`act-select-${index}`}
                  >
                    <button>{act.name}</button>
                  </MenuSelector>
                ))}
              </ul>
            </li>
            <li>
              <div tw="flex flex-col">
                <span>{selectedCampers.length} Campers Selected</span>
                <button onClick={camperSelection.clear}>Clear Selection</button>
                <button
                  onClick={() => {
                    if (selectedCampers.length > 0) {
                      setDisplayModal(true);
                    }
                  }}
                >
                  Reassign Selected
                </button>
              </div>
            </li>
          </>
        )}
        {period &&
          displayAll &&
          period.activities.map((a, aIndex) => (
            <Activity
              camperSelection={camperSelection}
              activity={a}
              activityIndex={aIndex}
              toggleHere={toggleHere}
            />
          ))}
        {period &&
          !displayAll &&
          period.activities
            .map((a, aIndex) => ({ ...a, index: aIndex }))
            .filter((a) => a.id === selected)
            .map((a) => (
              <Activity
                camperSelection={camperSelection}
                activity={a}
                activityIndex={a.index}
                toggleHere={toggleHere}
              />
            ))}
      </ul>
    </>
  );
};
export default ActivitySelector;
