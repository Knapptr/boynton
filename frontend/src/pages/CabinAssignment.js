import useGetDataOnMount from "../hooks/useGetData";
import Campers from "../components/Campers";
import Cabins from "../components/Cabins";
import { DragDropContext } from "@react-forked/dnd";
import { Route } from "react-router-dom";
import { useState, useContext } from "react";
import UserContext from "../components/UserContext";
import tw from "twin.macro";
import "styled-components/macro";
import useCabinSessions from "../hooks/useCabinSessions";
import CabinAssignmentIndex from "./cabinAssignmentIndex";
import UnitHeadAccess from "../components/ProtectedUnitHead";
import { PropagateLoader } from "react-spinners";
import { PopOut } from "../components/styled";
import NotFound from "./NotFound";

const CabinsOnlyButton = tw.button`bg-green-400 rounded p-3 text-white font-bold`;
const AssignmentHeader = tw.header`flex justify-around items-center bg-violet-500 gap-4 rounded-t text-white mb-2`;
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
  return (
    <>
      <Route
        path="assignment"
        element={
          <UnitHeadAccess>
            <CabinAssignmentIndex />
          </UnitHeadAccess>
        }
      />
      {routes}
      <Route
        path="*"
        element={
          <NotFound />
        } />
    </>
  );
};

const CabinAssignment = ({ area, weekNumber }) => {
  const auth = useContext(UserContext);
  const token = auth.userData.token;
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [cabinsOnly, setCabinsOnly] = useState(false);
  const [selectedCampers, setSelected] = useState([]);

  const toggleCabinsOnly = () => {
    setCabinsOnly((s) => !s);
  };
  const { cabinSessions, cabinList, updateCabinList, setCabinList } =
    useCabinSessions(weekNumber, area);


  const [allCampers, setData, updateData, loaded] = useGetDataOnMount({
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

  const allAssigned = () => {
    return unassignedCampers.length === 0;
  };

  const selectCamper = (id) => {
    setSelected((s) => [...s, id]);
  }

  const deselectCamper = (id) => {
    setSelected((s) => {
      // remove id from array
      // maybe just use a set here?
      const index = s.findIndex((v) => v == id);
      if (index == -1) { console.log(`Cannot deselect camper: ${id}. They are not currently selected.`) } else {
        // set state to updated array
        const newState = [...s]
        newState.splice(index, 1);
        return newState;
      }
    }
    )
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    cabinToCampers({ sourceList, sourceIndex, destinationIndex }) {
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
        <div tw="max-h-[45vh] lg:w-1/2 lg:max-h-screen overflow-auto relative ">
          <Campers
            select={selectCamper}
            deselect={deselectCamper}
            list={unassignedCampers}
            allCampers={allCampers}
            weekNumber={weekNumber}
            area={area}
          />
        </div>

        <div tw="max-h-[45vh] lg:w-1/2 lg:max-h-screen flex lg:flex-col flex-wrap lg:flex-nowrap overflow-auto ">
          <Cabins
            unassignCamper={unassignCamper}
            toggleUnassignModal={() => {
              setShowUnassignModal((d) => !d);
            }}
            cabinsOnly={false}
            cabinSessions={cabinSessions}
            lists={cabinList}
            weekNumber={weekNumber}
            area={area}
          />
        </div>
      </>
    );
  };
  const showOnlyCabins = () => {
    return (
      <div>
        <div tw=" overscroll-none flex flex-wrap overflow-auto ">
          <Cabins
            toggleUnassignModal={() => {
              setShowUnassignModal((d) => !d);
            }}
            unassignCamper={unassignCamper}
            showAllLists={cabinsOnly || allAssigned()}
            cabinSessions={cabinSessions}
            cabinsOnly={true}
            lists={cabinList}
            weekNumber={weekNumber}
            area={area}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {" "}
      {showUnassignModal && (
        <PopOut
          onClick={() => {
            setShowUnassignModal(false);
          }}
          shouldDisplay={true}
        >
          <div
            tw="bg-coolGray-200 p-4 rounded shadow"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <header>
              <h4 tw="font-bold text-lg">Unassign All Campers</h4>
              <p>Are you sure?</p>
              <button
                onClick={() => setShowUnassignModal(false)}
                tw="rounded bg-green-400 p-2 m-2"
              >
                Nevermind
              </button>{" "}
              <button
                tw=" rounded bg-red-400 m-2 p-2"
                onClick={async () => {
                  await unassignAll();
                  setShowUnassignModal(false);
                }}
              >
                Get rid of 'em
              </button>
            </header>
          </div>{" "}
        </PopOut>
      )}
      <div tw="relative">
        <DragDropContext
          onDragEnd={(drop) => {
            dragCamper(drop);
          }}
        >
          <AssignmentHeader>
            <h1 tw="inline">
              Cabin assignment{" "}
              <p tw="font-bold italic inline">
                {area.toUpperCase()}-Week {weekNumber}
              </p>
            </h1>
            {!allAssigned() && (
              <CabinsOnlyButton
                onClick={() => {
                  toggleCabinsOnly();
                }}
              >
                {cabinsOnly && "Show Unassigned Campers"}
                {!cabinsOnly && "Show Cabins Only"}
              </CabinsOnlyButton>
            )}
          </AssignmentHeader>
          <div tw="flex flex-col lg:flex-row">
            {loaded === false &&
              <div tw="my-2 py-8 text-center w-full ">
                <PropagateLoader loading={true} />
              </div>
            }
            {(cabinsOnly || allAssigned()) && showOnlyCabins()}
            {!cabinsOnly && !allAssigned() && showAll()}
          </div>
        </DragDropContext>
        <footer tw="h-1"></footer>
      </div>
    </>
  );
};

export default CabinAssignmentRoutes;
