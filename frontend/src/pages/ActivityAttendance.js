import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "../components/styled";

const SummaryBanner = styled.div(({allHere})=>[
  tw`text-sm flex justify-between  py-px font-bold px-2 bg-red-500 text-white transition-colors border border-b-black`,
  allHere && tw`bg-green-500`

])

const AttendantWrapper = styled.li(({ isChecked }) => [
  tw`bg-yellow-300 font-bold py-3 select-none transition-colors border border-white`,
  isChecked && tw`bg-green-400`,
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
  toggleIsPresent,
}) => {
  return (
    <AttendantWrapper isChecked={camper.isPresent}>
      <div tw="flex mx-auto px-8 md:px-32">
        <AttendanceName isPresent={camper.isPresent}>
          {camper.firstName} {camper.lastName}
        </AttendanceName>
        <AttendanceButton
          isPresent={camper.isPresent}
          onClick={async () => {
            toggleIsPresent(camperIndex);
            const options = {
              method: "PUT",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${localStorage.getItem("bearerToken")}`,
              },
              body: JSON.stringify({ isPresent: !camper.isPresent }),
            };
            await fetch(
              `/api/activities/${activity.id}/campers/${camper.camperActivityId}`,
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
const Activity = ({ activityId, refresh }) => {
  const [activity, setActivity, refreshActivities] = useGetDataOnMount({
    url: `/api/activities/${activityId}`,
    initialState: false,
    useToken: true,
    runOn: [activityId],
  });
  const timerRef = useRef(null);
  const timeOutRef = useRef(null);

  useEffect(() => {
    if (refresh) {
      timerRef.current = setInterval(() => {
        refreshActivities();
      }, 7000);
      setTimeout(()=>{
        timeOutRef.current = clearInterval(timerRef.current);
      },10 *60 * 1000)
    }else{
      if(timerRef.current){
      clearInterval(timerRef.current)
        clearTimeout(timeOutRef.current);
      }
    }
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(timeOutRef.current);
    };
  }, [refresh]);

  const toggleIsPresent = (camperIndex) => {
    const newCampers = [...activity.campers];
    console.log(camperIndex);
    const newCamper = {
      ...newCampers[camperIndex],
      isPresent: !newCampers[camperIndex].isPresent,
    };
    newCampers.splice(camperIndex, 1, newCamper);
    console.log({ newCampers });
    setActivity((act) => ({ ...act, campers: newCampers }));
  };
  const getUnaccountedFor = () => {
    const unaccounted = activity.campers.filter(
      (camper) => camper.isPresent === false
    );
    return unaccounted.length;
  };
  return (
    <>
      {activity && (
        <>
          <div tw="relative ">
            <header tw="mb-4 sticky top-0">
              <h2 tw="py-3 bg-lightBlue-500 text-xl font-bold text-white ">
                {activity.name}
              </h2>
              <SummaryBanner allHere={getUnaccountedFor() === 0} >
                <span>{activity.campers.length} campers total</span>
                {getUnaccountedFor()
                  ? <span>{getUnaccountedFor()} unaccounted for</span>
                  : <span>"All Here!"</span>}
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
                      key={`camper ${activity.name}-${camperIndex}`}
                      toggleIsPresent={toggleIsPresent}
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
  const [displayAll, setDisplayAll] = useState(true);
  const [shouldRefresh,setShouldRefresh] = useState(false)
  const [activities, setActivities, updateActivities] = useGetDataOnMount({
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
      <div tw="flex justify-center items-center my-2">
        <div tw="bg-blue-300 rounded py-px px-1">
        <label tw="mx-2" htmlFor="autoRefresh">Enable Auto Refresh</label>
          <input onChange={()=>{
            //refresh immedately
            if(!shouldRefresh){updateActivities()}
            setShouldRefresh(r=>!r)
          } } type="checkbox" name="autoRefresh" id="autoRefresh"/>
        </div>
      </div>
      <div tw="flex flex-col gap-2 ">
        {displayAll
          ? activities.map((activity, index) => (
              <Activity refresh={shouldRefresh} activityId={activity.id} />
            ))
          : selected !== "none" && (
              <Activity refresh={shouldRefresh} activityId={activities[selected].id} />
            )}
      </div>
    </>
  );
};
export default ActivitySelector;
