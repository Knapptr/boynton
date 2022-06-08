import { useParams } from "react-router-dom";
import { useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "../components/styled";

const AttendantWrapper = styled.li(({ isChecked }) => [
  tw`bg-red-100 font-bold py-3 `,
  isChecked && tw`line-through bg-green-100`,
]);
const CamperAttendant = ({ camperIndex,camper, activity,toggleIsPresent }) => {
  return (
    <AttendantWrapper
      onClick={async () => {
        toggleIsPresent(camperIndex); 
        const options = {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("bearerToken")}`,
          },
          body: JSON.stringify({ isPresent: !(camper.isPresent) }),
        };
        await fetch(
          `/api/activities/${activity.id}/campers/${camper.camperActivityId}`,
          options
        );
        }}
      isChecked={camper.isPresent}
    >
      {camper.firstName} {camper.lastName}
    </AttendantWrapper>
  );
};
const Activity = ({ activityId, editable }) => {
  const [activity, setActivity] = useGetDataOnMount({
    url: `/api/activities/${activityId}`,
    initialState: false,
    useToken: true,
    runOn: [activityId],
  });
  const toggleIsPresent = (camperIndex) => {
    const newCampers = [...activity.campers];
    console.log(camperIndex)
    const newCamper = {...newCampers[camperIndex], isPresent: !newCampers[camperIndex].isPresent}
    newCampers.splice(camperIndex,1,newCamper);
    console.log({newCampers})
    setActivity((act) => ({ ...act,campers:newCampers }));
  };
  const getUnaccountedFor = ()=>{
    const unaccounted = activity.campers.filter(camper=>camper.isPresent === false);
    return unaccounted.length
  }
  return (
    <>
      {activity && (
        <>
          <div tw="relative">
            <header tw="my-4 sticky top-0">
              <h2 tw="py-3 bg-lightBlue-500 text-xl font-bold text-white ">
                {activity.name}
              </h2>
              <h3 tw="text-sm text-right bg-gray-300 py-px font-bold px-2">
                {activity.campers.length} campers total
              </h3>
              <h3 tw="text-sm text-right bg-gray-300 py-px font-bold px-2">
                {getUnaccountedFor()?`${getUnaccountedFor()} unaccounted for`:"All Here!"} 
              </h3>
            </header>
            <ul>
              {activity.campers.length === 0 ? (
                <li>no campers</li>
              ) : (
                activity.campers
                  .sort((camper1, camper2) => {
                    return camper1.lastName > camper2.lastName ? 1 : -1;
                  })
                  .map((camper,camperIndex) => (
                    <CamperAttendant
                      key={`camper ${activity.name}-${camperIndex}`}
                      toggleIsPresent = {toggleIsPresent}
                      camperIndex={camperIndex}
                      camper={camper}
                      activity={activity}
                    ></CamperAttendant>
                  ))
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

const ActivitySelector = () => {
  const { periodId } = useParams();
  const [selected, setSelected] = useState("none");
  const [displayAll, setDisplayAll] = useState(false);
  const [activities, setActivities] = useGetDataOnMount({
    url: `/api/periods/${periodId}/activities`,
    initialState: [],
    useToken: true,
  });
  return (
    <>
      <ul tw="flex gap-1 flex-wrap justify-center">
        {activities &&
          activities.map((activity, index) => (
            <MenuSelector
              isSelected={index === selected}
              key={`activity-${index}`}
            >
              <button
                onClick={() => {
                  setSelected(index);
                  setDisplayAll(false);
                }}
              >
                {activity.name}
              </button>
            </MenuSelector>
          ))}
        <MenuSelector isSelected={displayAll} color="blue">
          <button
            onClick={() => {
              setDisplayAll(true);
              setSelected("none");
            }}
          >
            All
          </button>
        </MenuSelector>
      </ul>
      <div>
        {displayAll
          ? activities.map((activity, index) => (
              <Activity activityId={activity.id} />
            ))
          : selected !== "none" && (
              <Activity activityId={activities[selected].id} />
            )}
      </div>
    </>
  );
};
export default ActivitySelector;
