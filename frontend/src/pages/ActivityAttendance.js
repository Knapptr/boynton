import { useParams } from "react-router-dom";
import { useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const AttendantWrapper = styled.li(({ isChecked }) => [
    tw`bg-red-100 font-bold`,
    isChecked && tw`line-through bg-green-100`,
]);
const CamperAttendant = ({ camper, isChecked }) => {
    const [selfIsChecked, setIsChecked] = useState(isChecked);
    return (
        <AttendantWrapper
            onClick={() => {
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
            {activities &&
                activities.map((activity, index) => (
                    <li key={`activity-${index}`}>
                        <button
                            onClick={() => {
                                setSelected(index);
                                setDisplayAll(false);
                            }}
                        >
                            {activity.name}
                        </button>
                    </li>
                ))}
            <li>
                <button
                    onClick={() => {
                        setDisplayAll(true);
                        setSelected("none");
                    }}
                >
                    All
                </button>
            </li>
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
