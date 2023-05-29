import useActivityAttendance from "../hooks/useActivityAttendance";
import { useContext } from 'react'
import { DragDropContext, Droppable, Draggable } from "@react-forked/dnd";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import toTitleCase from "../toTitleCase";
import UserContext from "./UserContext";

const CamperItem = styled.li(({ isDragging, isSelected }) => [
  tw`border p-1 bg-green-50 cursor-pointer select-none`,
  isDragging && tw`bg-green-400`,
  isSelected && tw`bg-green-600`
]);
const ActivityList = styled.ul(({ blue, isDraggingOver }) => [
  tw`p-3 bg-purple-200 justify-center flex flex-col items-center gap-1 cursor-pointer select-none`,
  blue && tw`bg-blue-200`,
  isDraggingOver && tw`bg-purple-600`,
  isDraggingOver && blue && tw`bg-blue-500`,
]);
const SelectActivities = ({
  periodId,
  cabinName,
  selectedCampers,
  handleSelectCamper,
  dayName,
  periodNumber,
  isTheLastPeriod,
  selectNext,
}) => {
  const {
    loading: activitiesLoading,
    activityLists,
    updateActivityAttendance,
  } = useActivityAttendance(periodId, cabinName);
  const auth = useContext(UserContext)

  const addCamperActivityToDB = async (camperWeekId, activitySessionId, periodId) => {
    const camper = {
      camperWeekId,
      periodId,
    };
    const reqConfig = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(camper),
    };
    // console.log(reqConfig);
    const result = await fetchWithToken(
      `/api/activity-sessions/${activitySessionId}/campers`,
      reqConfig,
      auth
    );
    const data = await result.json();
  };

  return (
    <div tw="flex flex-col max-w-3xl mx-auto">
      {activitiesLoading ? (
        <h2 tw="animate-bounce">Loading</h2>
      ) : (
        <>
          <div tw=" flex-col md:flex-row flex justify-center ">
            {activityLists.unassigned &&
              activityLists.unassigned.campers.length > 0 && (
                <div tw="w-full my-2 md:mx-2">
                  <ActivityList
                    blue
                    isDraggingOver={false}
                  >
                    <header tw="w-full font-bold ">
                      <h2>Unassigned</h2>
                    </header>
                    {activityLists.unassigned &&
                      activityLists.unassigned.campers.map((c, index) => (
                        <CamperItem
                          // ref={provided.innerRef}
                          key={`unassigned-camper-${c.camperSessionId}`}
                          isDragging={false}
                          isSelected={selectedCampers.some(sc => sc.camperSessionId === c.camperSessionId)}
                          onClick={() => handleSelectCamper(c)}
                        >
                          {c.firstName} {c.lastName}
                        </CamperItem>
                      ))}
                  </ActivityList>

                </div>
              )}
            <div tw=" gap-1 flex flex-row md:flex-col w-full my-2 md:mx-2 flex-wrap ">
              {activityLists.activityIds &&
                activityLists.activityIds.map((aid, index) => (
                  <ActivityList
                    key={`activity-list-${aid}`}
                    tw="flex-grow"
                    isDraggingOver={false}
                    onClick={() => {
                      console.log("Assign campers to DB");
                      console.log("Assigning", selectedCampers);
                      const campersToAdd = [...selectedCampers];
                      while (campersToAdd.length > 0) {
                        const addedCamper = campersToAdd.pop();
                        addCamperActivityToDB(addedCamper.camperSessionId, aid, periodId)
                      }

                    }}
                  >
                    <header>
                      <h2 tw="font-bold">
                        {toTitleCase(activityLists[aid].name)}
                      </h2>
                    </header>
                    {activityLists[aid].campers.map((c, index) => (
                      <CamperItem
                        key={`camper-assingment-${c.camperSessionId}`}
                      // isDragging={snapshot.isDragging}
                      // {...provided.dragHandleProps}
                      // {...provided.draggableProps}
                      // ref={provided.innerRef}
                      >
                        {toTitleCase(c.firstName)}{" "}
                        {toTitleCase(c.lastName)}
                      </CamperItem>
                    ))}
                  </ActivityList>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectActivities;
