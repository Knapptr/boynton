import Campers from "../components/Campers";
import Cabins from "../components/Cabins";
import { Route } from "react-router-dom";
import { useState, useContext, useEffect, useCallback } from "react";
import UserContext from "../components/UserContext";
import tw from "twin.macro";
import "styled-components/macro";
import useCabinSessions from "../hooks/useCabinSessions";
import CabinAssignmentIndex from "./cabinAssignmentIndex";
import UnitHeadAccess from "../components/ProtectedUnitHead";
import { PropagateLoader } from "react-spinners";
import { PopOut } from "../components/styled";
import NotFound from "./NotFound";
import fetchWithToken from "../fetchWithToken";

const CabinsOnlyButton = tw.button`bg-green-400 rounded p-3 text-white font-bold`;
const AssignmentHeader = tw.header`flex justify-around items-center bg-violet-500 gap-4 rounded-t text-white mb-2`;

// CONSTANTS
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

  /** Toggle the visibility of campers / cabins */
  const toggleCabinsOnly = () => {
    setCabinsOnly((s) => !s);
  };
  const { cabinSessions, refreshCabins, cabinList, updateCabinList, setCabinSessions, setCabinList } =
    useCabinSessions(weekNumber, area);


  const [allCampers, setAllCampers] = useState({ unassigned: [], all: [] })

  const getCampers = useCallback(async () => {
    const response = await fetchWithToken(`/api/camper-weeks?week=${weekNumber}&area=${area}`, {}, auth);
    const ungroupedCampers = await response.json();
    const unassigned = [];
    const all = [];

    for (const camper of ungroupedCampers) {
      all.push(camper);
      if (camper.cabinSessionID === null) {
        unassigned.push(camper);
      }
    }

    setAllCampers({ unassigned, all });
  }, [auth, area, weekNumber]
  );

  useEffect(() => {
    getCampers();
  }, [weekNumber, area, auth])


  /** Check if all campers are assigned **/
  const allAssigned = () => {
    console.log({ allCampers });
    return allCampers.all.length > 0 && allCampers.unassigned.length === 0;
  };

  /** Add camper to selected campers
    * @param {camperSession} camper The camper to add to the selection
  */
  const selectCamper = (camper) => {
    setSelected((s) => [...s, camper]);
  }
  /** Remove all selected campers from the unassigned list */
  const removeSelectedFromUnassigned = () => {
    // filter unassigned
    setAllCampers(campers => {
      const updatedList = campers.unassigned.filter(camper => !selectedCampers.some(selCamp => selCamp.id === camper.id));
      return { all: campers.all, unassigned: updatedList };
    })
  }

  /** Remove a camper from the selected campers array 
    * @param {number} sessionId The camper session id to remove from the list of selected campers*/
  const deselectCamper = (sessionId) => {
    setSelected((s) => {
      // remove id from array
      // maybe just use a set here?
      const index = s.findIndex((v) => v.id === sessionId);
      if (index === -1) { console.log(`Cannot deselect camper: ${sessionId}. They are not currently selected.`) } else {
        // set state to updated array
        const newState = [...s]
        newState.splice(index, 1);
        return newState;
      }
    }
    )
  }

  /** Sort a list of campers by age IN PLACE
    * @param {camperSession[]} camperSessions The list of campers to be sorted 
  */
  const sortByAge = (camperSessions) => {
    // should sort alpha by last name first ??
    // sort by age
    camperSessions.sort((a, b) => a.age - b.age || a.lastName.localeCompare((b.lastName)))
  }
  /** Send camper to cabin on the DB
    * @param {camperSession} camperSession an object with a camperId and a session Id (id)
    * @param {string} cabinNumber (a unique cabin identifier)
    */
  const assignCabin = async (cabinSession) => {
    const camperSessions = [...selectedCampers];
    if (camperSessions.length > cabinSession.capacity - cabinSession.campers.length) {
      console.log("Handle this case: Not enough space for all selected campers");
      return;
    }
    removeSelectedFromUnassigned();
    updateCabinUI(cabinSession.name, [...selectedCampers]);

    const url = `/api/cabin-sessions/${cabinSession.id}/campers`
    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,

      },
      body: JSON.stringify({
        campers: camperSessions
      }),
    };
    const results = await fetch(
      url,
      requestConfig
    );
    //clear selected
    setSelected([]);
    // Update state from DB
    refreshCabins();
    getCampers();
  };

  /** Push selected campers into cabin selection (optimistic UI update)
    * @param {string} cabinName Cabin name / number (the unique cabin identifier)
    * @param {campers[]} campers List of campers to be added to cabin
    */
  const updateCabinUI = (cabinName, campers) => {
    let targetIndex = cabinSessions.findIndex(c => c.name === cabinName);
    const updatedList = [...cabinSessions]
    let targetCabin = updatedList.splice(targetIndex, 1)[0];
    if (targetCabin === undefined) { throw new Error("Something went wrong in Eager UI update") }
    targetCabin.campers = targetCabin.campers.concat(campers);
    sortByAge(targetCabin.campers);
    updatedList.splice(targetIndex, 0, targetCabin);
    setCabinSessions(updatedList);
  }

  const unassignReq = async (camperSessionId, cabinSessionId) => {
    const url = `/api/cabin-sessions/${cabinSessionId}/campers/${camperSessionId}`
    const options = {
      method: "DELETE"
    }
    //Eager UI updates
    let camper = undefined;
    setCabinSessions(c => {
      // remove from assigned
      const newState = [...c];
      const newCabinIndex = newState.findIndex(cab => cab.id === cabinSessionId);
      const newCabin = { ...newState[newCabinIndex] };
      const newCampers = [...newCabin.campers];
      const camperIndex = newCampers.find(camper => camper.id === camperSessionId);
      camper = newCampers.splice(camperIndex, 1)[0];
      newCabin.campers = newCampers;
      newState[newCabinIndex] = newCabin;
      return newState
    })
    // add to unassigned
    setAllCampers(c => {
      const updatedList = [...c.unassigned, camper];
      sortByAge(updatedList);
      return { unassigned: updatedList, all: c.all };

    });
    const result = await fetchWithToken(url, options, auth);

  }
  /** Unassign all campers from cabins */
  const unassignAll = async () => {
    // API req data
    console.log({ area })
    const url = `/api/weeks/${weekNumber}/cabin-sessions/campers?area=${area.toUpperCase()}`;
    const options = { method: "DELETE" };
    // Eager UI update
    // Add all removed campers to unassigned
    let unassignedCampers = [...allCampers.unassigned];
    unassignedCampers = unassignedCampers.concat(...cabinSessions.map(c => c.campers))
    sortByAge(unassignedCampers);
    setAllCampers(ac => ({ ...ac, unassigned: unassignedCampers }));
    //remove all campers from cabins
    setCabinSessions(cs => {
      return cs.map(c => ({ ...c, campers: [] }));
    })
    // API Request
    const results = await fetchWithToken(url, options, auth);
    // Refresh page from DB
    refreshCabins();
    getCampers();

  };

  /** Show Both Cabins and Campers **/
  const showAll = () => {
    return (
      <>
        <div tw="max-h-[45vh] lg:w-1/2 lg:max-h-screen overflow-auto relative ">
          <Campers
            select={selectCamper}
            deselect={deselectCamper}
            list={allCampers.unassigned}
            allCampers={allCampers.all}
            weekNumber={weekNumber}
            area={area}
          />
        </div>

        <div tw="max-h-[45vh] lg:w-1/2 lg:max-h-screen flex lg:flex-col flex-wrap lg:flex-nowrap overflow-auto ">
          <Cabins
            unassign={unassignReq}
            assign={assignCabin}
            toggleUnassignModal={() => {
              setShowUnassignModal((d) => !d);
            }}
            cabinsOnly={false}
            cabinSessions={cabinSessions}
            weekNumber={weekNumber}
            area={area}
          />
        </div>
      </>
    );
  };

  /** Display Cabins Only */
  const showOnlyCabins = () => {
    return (
      <div>
        <div tw=" overscroll-none flex flex-wrap overflow-auto ">
          <Cabins
            toggleUnassignModal={() => {
              setShowUnassignModal((d) => !d);
            }}
            unassign={unassignReq}
            showAllLists={cabinsOnly || allAssigned()}
            cabinSessions={cabinSessions}
            cabinsOnly={true}
            weekNumber={weekNumber}
            area={area}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <>
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
          <AssignmentHeader>
            <h1 tw="inline">
              Cabin assignment{" "}
              <p tw="font-bold italic inline">
                {area.toUpperCase()}-Week {weekNumber}
              </p>
            </h1>
            <p>
              {!allAssigned() && `${selectedCampers.length} campers selected`}
            </p>
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
            {allCampers.all.length === 0 && allCampers.unassigned.length === 0 &&
              <div tw="my-2 py-8 text-center w-full ">
                <PropagateLoader loading={true} />
              </div>
            }
            {(cabinsOnly || allAssigned()) && showOnlyCabins()}
            {!cabinsOnly && !allAssigned() && showAll()}
          </div>
          <footer tw="h-1"></footer>
        </div>
      </>
    </>
  );
};

export default CabinAssignmentRoutes;
