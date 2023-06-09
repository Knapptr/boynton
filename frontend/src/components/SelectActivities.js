import useActivityAttendance from "../hooks/useActivityAttendance";
import { useContext, useEffect } from 'react'
import lodash from "lodash";
import { postCampersToActivity } from "../requests/activity";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import toTitleCase from "../toTitleCase";
import UserContext from "./UserContext";
import { Skeleton } from "@mui/material";

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
  clearSelection
}) => {
  const {
    loading: activitiesLoading,
    activityLists,
    setLists,
    refresh
  } = useActivityAttendance(periodId, cabinName);

  const auth = useContext(UserContext)


  const handleSubmit = async (activitySessionId) => {

    if (selectedCampers.length > 0 && selectedCampers.some(c => c.sourceId !== activitySessionId)) {
      const campersToAdd = [...selectedCampers];
      try {
        const response = await postCampersToActivity(campersToAdd.map(c => c.camper), activitySessionId, auth);
      } catch (e) {
        console.log("Something went wrong assigning campers to db", e); refresh();
      }
      // Eagerly update UI
      let newState = lodash.cloneDeep(activityLists)
      for (const selectedCamper of campersToAdd) {
        // Remove camper from source
        newState[selectedCamper.sourceId].campers = newState[selectedCamper.sourceId].campers.filter(c => c.camperSessionId !== selectedCamper.camper.camperSessionId);
        // Add camper to destination
        newState[activitySessionId].campers.push(selectedCamper.camper);
      }
      // update state
      clearSelection();
      setLists(newState);

    }
  }


  return (
    <div tw="flex flex-col max-w-3xl mx-auto">
      <div tw=" flex-col md:flex-row flex justify-center ">
        {activitiesLoading ? (
          <div tw="w-full my-2 md:mx-2 flex justify-around">
            <Skeleton animation="wave" variant="rectangular" height={400} width={350} />
            <Skeleton animation="wave" variant="rectangular" height={400} width={350} />
          </div>
        ) : (
          <>
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
                      [...activityLists.unassigned.campers].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((c, index) => (
                        <CamperItem
                          key={`unassigned-camper-${c.camperSessionId}`}
                          isDragging={false}
                          isSelected={selectedCampers.some(sc => sc.camper.camperSessionId === c.camperSessionId)}
                          onClick={() => handleSelectCamper(c, "unassigned")}
                        >
                          {toTitleCase(c.firstName)} {toTitleCase(c.lastName)} <span tw="text-xs">{c.age}</span>
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
                    onClick={() => { handleSubmit(aid) }}
                  >
                    <header>
                      <h2 tw="font-bold">
                        {toTitleCase(activityLists[aid].name)}
                      </h2>
                    </header>
                    {/* Alphabetize here, so that ui updates are consistant*/}
                    {[...activityLists[aid].campers].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((c, index) => (
                      <CamperItem
                        isSelected={selectedCampers.some(sc => sc.camper.camperSessionId === c.camperSessionId)}
                        key={`camper-assingment-${c.camperSessionId}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCamper(c, aid);
                        }}
                      >
                        {toTitleCase(c.firstName)} {toTitleCase(c.lastName)} <span tw="text-xs">{c.age}</span>
                      </CamperItem>
                    ))}
                  </ActivityList>
                ))}
            </div>
          </>
        )
        }
      </div>
    </div >
  );
};

export default SelectActivities;
