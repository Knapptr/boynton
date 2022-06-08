import useGetDataOnMount from "../hooks/useGetData";
import Campers from "../components/Campers";
import Cabins from "../components/Cabins";
import { DragDropContext } from "@react-forked/dnd";
import { Route } from "react-router-dom";
import { useState,useContext } from "react";
import UserContext from '../components/UserContext';
import tw from "twin.macro";
import "styled-components/macro";
import useCabinSessions from "../hooks/useCabinSessions";
import Protected from "../components/Protected";
import CabinAssignmentIndex from './cabinAssignmentIndex';
import UnitHeadAccess from "../components/ProtectedUnitHead";

const CabinsOnlyButton = tw.button`bg-green-400 rounded p-3 text-white font-bold`
const AssignmentHeader =tw.header`flex justify-around items-center bg-violet-500 gap-4 rounded-t text-white`;
const areas = ["ba", "ga"];
const weeks = ["1", "2", "3", "4", "5", "6"];

const CabinAssignmentRoutes = () => {
  const routes = [];
  for (const week of weeks) {
    for (const area of areas) {
      routes.push(
        <Route
          key={`cabinRoute-${area}${week}]`}
          path={`assignment/${area}/${week}`}
          element={
            <UnitHeadAccess>
              <CabinAssignment area={area} weekNumber={week} />
            </UnitHeadAccess>
          }
        />
      );
    }
  }
    return <>
        <Route path="assignment" element={<UnitHeadAccess><CabinAssignmentIndex/></UnitHeadAccess>}/>
        { routes }</>
};

const CabinAssignment = ({ area, weekNumber }) => {

    const auth  = useContext(UserContext)
    const token = auth.userData.token

  const [cabinsOnly, setCabinsOnly] = useState(false);

  const toggleCabinsOnly = () => {
    setCabinsOnly((s) => !s);
  };
  const { cabinSessions, cabinList, updateCabinList, setCabinList } =
    useCabinSessions(weekNumber, area);

  const [allCampers] = useGetDataOnMount({
    url: `/api/camper-weeks?week=${weekNumber}&area=${area}`,
    initialState: [],
    useToken: true,
  });

  const [unassignedCampers, setCampers] = useGetDataOnMount({
    url: `/api/camper-weeks?week=${weekNumber}&area=${area}&cabin=unassigned`,
    useToken: true,
    initialState: [],
    optionalSortFunction: (camper1, camper2) => camper1.age - camper2.age,
  });

    const allAssigned = ()=>{
            return unassignedCampers.length === 0
    }
  const unassignCamper = (camperSession, camperIndex, cabinName) => {
    dragOptions.cabinToCampers({
      sourceList: cabinName,
      destinationList: "campers",
      destinationIndex: 0,
      sourceIndex: camperIndex,
    });
  };

  const unassignAll = async () => {
    let campers = [...unassignedCampers];
    let newlyUnassignedCampers = [];
    let updatedCabinList = { ...cabinList };
    for (let cabin of cabinSessions) {
      newlyUnassignedCampers = [
        ...newlyUnassignedCampers,
        ...cabinList[cabin.cabinName],
      ];
      updatedCabinList[cabin.cabinName] = [];
    }
    await Promise.all(newlyUnassignedCampers.map((c) => assignCabin(c, false)));
    campers = [...campers, ...newlyUnassignedCampers];
    setCampers(campers);
    setCabinList(updatedCabinList);
  };

  const assignCabin = async (camperSession, cabinNumber) => {
    //get id from sessions
    const cabinSession =
      cabinSessions.find((cabin) => cabin.cabinName === cabinNumber) || null;
    const requestConfig = {
      method: "PUT",
        headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}`},
      body: JSON.stringify({
        cabinSessionID: cabinSession ? cabinSession.id : null,
      }),
    };
    const results = await fetch(
      `/api/campers/${camperSession.camperID}/${camperSession.id}/cabin`,
      requestConfig
    );
  };

  const dragOptions = {
    campersToCabin({
      sourceList,
      destinationList,
      sourceIndex,
      destinationIndex,
    }) {
      const destinationItems = [...unassignedCampers];
      const sourceItems = [...cabinList[destinationList]];
      const camper = destinationItems.splice(sourceIndex, 1)[0];
      sourceItems.splice(destinationIndex, 0, camper);
      assignCabin(camper, destinationList);
      updateCabinList(destinationList, sourceItems);
      setCampers([...destinationItems]);
    },
    cabinToCampers({
      sourceList,
      destinationList,
      sourceIndex,
      destinationIndex,
    }) {
      const destinationItems = [...unassignedCampers];
      const sourceItems = [...cabinList[sourceList]];
      const camper = sourceItems.splice(sourceIndex, 1)[0];
      destinationItems.splice(destinationIndex, 0, camper);
      assignCabin(camper, false);
      updateCabinList(sourceList, sourceItems);
      setCampers([...destinationItems]);
    },
    cabinToCabin({
      sourceList,
      destinationList,
      sourceIndex,
      destinationIndex,
    }) {
      const sourceItems = [...cabinList[sourceList]];
      const destinationItems = [...cabinList[destinationList]];
      const camper = sourceItems.splice(sourceIndex, 1)[0];
      destinationItems.splice(destinationIndex, 0, camper);
      assignCabin(camper, destinationList);
      updateCabinList(
        destinationList,
        destinationItems,
        sourceList,
        sourceItems
      );
      return;
    },
  };

  const dragCamper = ({ source, destination }) => {
    // console.log({ source, destination });
    if (!destination) {
      return;
    }
    const dragData = {
      sourceList: source.droppableId,
      destinationList: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    };
    if (dragData.sourceList === dragData.destinationList) {
      return;
    }
    if (dragData.sourceList === "unassigned") {
      dragOptions.campersToCabin(dragData);
      return;
    }
    if (dragData.destinationList === "unassigned") {
      dragOptions.cabinToCampers(dragData);
      return;
    }
    dragOptions.cabinToCabin(dragData);
  };

  const showAll = () => {
    return (
      <>
        <AssignmentHeader ><h1 tw="inline">Cabin assignment <p tw="font-bold italic md:inline">{area.toUpperCase()}-Week {weekNumber}</p></h1>
          <CabinsOnlyButton
            onClick={() => {
              toggleCabinsOnly();
            }}
          >
            Show Cabins Only
          </CabinsOnlyButton>
        </AssignmentHeader>
        <div>
        </div>
        <div tw="max-h-[45vh] overflow-auto relative ">
          <Campers
            list={unassignedCampers}
            allCampers={allCampers}
            weekNumber={weekNumber}
            area={area}
          />
        </div>

        <div tw=" flex flex-wrap overflow-auto max-h-[45vh]">
          <Cabins
            unassignCamper={unassignCamper}
            cabinSessions={cabinSessions}
            lists={cabinList}
            weekNumber={weekNumber}
            area={area}
            unassignAll={unassignAll}
          />
        </div>
      </>
    );
  };
  const showOnlyCabins = () => {
    return (
      <div>
        <AssignmentHeader ><h1 tw="inline">Cabin assignment <p tw="font-bold italic inline">{area.toUpperCase()}-Week {weekNumber}</p></h1>
          {!allAssigned() &&
          <CabinsOnlyButton
            onClick={() => {
              toggleCabinsOnly();
            }}
          >
            Show Unassigned Campers
          </CabinsOnlyButton>
        }
        </AssignmentHeader>
        <div tw=" overscroll-none flex flex-wrap overflow-auto ">
          <Cabins
            unassignCamper={unassignCamper}
              showAllLists = {cabinsOnly || allAssigned()}
            cabinSessions={cabinSessions}
            lists={cabinList}
            weekNumber={weekNumber}
            area={area}
            unassignAll={unassignAll}
          />
        </div>
      </div>
    );
  };

  return (
    <div tw="relative ">
      <DragDropContext
        onDragEnd={(drop) => {
          dragCamper(drop);
        }}
      >
        {cabinsOnly || allAssigned() ? showOnlyCabins() : showAll()}
      </DragDropContext>
      <footer tw="h-1"></footer>
    </div>
  );
};

export default CabinAssignmentRoutes;
