import { useParams } from "react-router-dom";
import { useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import {MenuSelector} from "../components/styled";

const AttendantWrapper = styled.li(({ isChecked }) => [
    tw`bg-red-100 font-bold`,
    isChecked && tw`line-through bg-green-100`,
]);
const CamperAttendant = ({ camper, activity, }) => {
    const [selfIsChecked, setIsChecked] = useState(camper.isPresent);
    return (
        <AttendantWrapper
            onClick={async() => {
                const options = {
                    method: "PUT",
                    headers: {"content-type":"application/json",authorization: `Bearer ${localStorage.getItem('bearerToken')}`},
                    body: JSON.stringify( {isPresent: !selfIsChecked} )
                }
                await fetch(`/api/activities/${activity.id}/campers/${camper.camperActivityId}`,options)
                setIsChecked((c) => !c);
            }}
            isChecked={selfIsChecked}
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
    return (
        <>
            {activity && (
                <>
                    <header>
                        <h2>{activity.name}</h2>
                    </header>
                    <ul>
                        {activity.campers.length === 0 ? (
                            <li>no campers</li>
                        ) : (
                            activity.campers
                                .sort((camper1, camper2) => {
                                    return camper1.lastName > camper2.lastName
                                        ? 1
                                        : -1;
                                })
                                .map((camper) => (
                                    <CamperAttendant
                                        camper={camper}
                                        activity={activity}
                                    ></CamperAttendant>
                                ))
                        )}
                    </ul>
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
            <MenuSelector key={`activity-${index}`}>
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
              <MenuSelector color="blue" >
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
