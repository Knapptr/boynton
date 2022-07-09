import useActivityAttendance from "../hooks/useActivityAttendance";
import {useContext} from 'react'
import { DragDropContext, Droppable, Draggable } from "@react-forked/dnd";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import toTitleCase from "../toTitleCase";
import UserContext from "./UserContext";

const CamperItem = styled.li(({ isDragging }) => [
  tw`border p-1 bg-green-50`,
  isDragging && tw`bg-green-400`,
]);
const ActivityList = styled.ul(({ blue, isDraggingOver }) => [
  tw`p-3 bg-purple-200 justify-center flex flex-col items-center gap-1`,
  blue && tw`bg-blue-200`,
  isDraggingOver && tw`bg-purple-600`,
  isDraggingOver && blue && tw`bg-blue-500`,
]);
const SelectActivities = ({
  periodId,
  cabinName,
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
  const addCamperActivityToDB = async (camperWeekId, activityId, periodId) => {
    const camper = {
      camperWeekId,
      periodId,
    };
    const reqConfig = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(camper),
    };
    console.log(reqConfig);
    const result = await fetchWithToken(
      `/api/activities/${activityId}/campers`,
      reqConfig,
      auth
    );
    const data = await result.json();
  };
  const handleListMovement = async (
    sourceListId,
    sourceIndex,
    destinationListId,
    destinationIndex
  ) => {
    if (sourceListId === destinationListId) {
      return;
    }
    const newDestination = [...activityLists[destinationListId].campers];
    const newSource = [...activityLists[sourceListId].campers];
    const camper = newSource.splice(sourceIndex, 1)[0];
    newDestination.splice(destinationIndex, 0, camper);
    updateActivityAttendance(
      sourceListId,
      destinationListId,
      newSource,
      newDestination
    );
    if (destinationListId === "unassigned") {
      return;
    }
    await addCamperActivityToDB(camper.weekId, destinationListId, periodId);
  };
  return (
    <DragDropContext
      onDragEnd={({ source, destination }) => {
        if (!destination) {
          return;
        }
        handleListMovement(
          source.droppableId,
          source.index,
          destination.droppableId,
          destination.index
        );
      }}
    >
      <div tw="flex flex-col max-w-3xl mx-auto">
        {activitiesLoading ? (
          <h2 tw="animate-bounce">Loading</h2>
        ) : (
          <>
            <div tw=" flex-col md:flex-row flex justify-center ">
              {activityLists.unassigned &&
                activityLists.unassigned.campers.length > 0 && (
                  <div tw="w-full my-2 md:mx-2">
                    <Droppable droppableId="unassigned">
                      {(provided, snapshot) => (
                        <ActivityList
                          blue
                          isDraggingOver={snapshot.isDraggingOver}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <header tw="w-full font-bold ">
                            <h2>Unassigned</h2>
                          </header>
                          {activityLists.unassigned &&
                            activityLists.unassigned.campers.map((c, index) => (
                              <Draggable
                                index={index}
                                draggableId={`${c.weekId}`}
                                key={`unassigned-draggable-${c.weekId}`}
                              >
                                {(provided, snapshot) => (
                                  <CamperItem
                                    {...provided.dragHandleProps}
                                    {...provided.draggableProps}
                                    ref={provided.innerRef}
                                    isDragging={snapshot.isDragging}
                                  >
                                    {c.firstName} {c.lastName}
                                  </CamperItem>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </ActivityList>
                      )}
                    </Droppable>
                  </div>
                )}
              <div tw=" gap-1 flex flex-row md:flex-col w-full my-2 md:mx-2 flex-wrap ">
                {activityLists.activityIds &&
                  activityLists.activityIds.map((aid, index) => (
                    <Droppable
                      key={`activity-container=${index}`}
                      droppableId={`${aid}`}
                    >
                      {(provided, snapshot) => (
                        <ActivityList
                          tw="flex-grow"
                          isDraggingOver={snapshot.isDraggingOver}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <header>
                            <h2 tw="font-bold">
                              {toTitleCase(activityLists[aid].name)}
                            </h2>
                          </header>
                          {activityLists[aid].campers.map((c, index) => (
                            <Draggable
                              draggableId={`${c.weekId}`}
                              index={index}
                              key={`draggable-camper-${c.weekId}`}
                            >
                              {(provided, snapshot) => (
                                <CamperItem
                                  isDragging={snapshot.isDragging}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                >
                                  {toTitleCase(c.firstName)}{" "}
                                  {toTitleCase(c.lastName)}
                                </CamperItem>
                              )}
                            </Draggable>
                          ))}
                          {/* {provided.placeholder} */}
                        </ActivityList>
                      )}
                    </Droppable>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DragDropContext>
  );
};

export default SelectActivities;
