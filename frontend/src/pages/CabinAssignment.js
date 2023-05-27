import useGetDataOnMount from "../hooks/useGetData";
import Campers from "../components/Campers";
import Cabins from "../components/Cabins";
import { Route } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
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

  useEffect(() => {
    const getCampers = async () => {
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
    }
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
      if (index == -1) { console.log(`Cannot deselect camper: ${sessionId}. They are not currently selected.`) } else {
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
  const assignCabin = async (camperSession, cabinSession) => {
    console.log("Assigning", { camperSession, cabinSession });
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
      `/api/campers/${camperSession.camperId}/${camperSession.id}/cabin`,
      requestConfig
    );
  };

  /** Send all campers from selected campers to a cabin
    * @param {string} cabinNumber is a unique indentifier of a cabin
    * @param {number} currentAmt number of campers in cabin
    */
  const sendAllToCabin = async (cabinSession, currentAmt) => {
    // Check cabin capacity
    if (currentAmt + selectedCampers.length > cabinSession.capacity) {
      // TODO handle this case
      console.log("Handle this case: Not enough space for all selected campers");
      return;
    }
    // Eager UI State change
    console.log("Eagerly updating UI");
    removeSelectedFromUnassigned();
    updateCabinUI(cabinSession.name, [...selectedCampers]);

    // Action
    let promises = selectedCampers.map(({ camperId, id }) => assignCabin({ camperId, id }, cabinSession));
    try {
      console.log("Sending to DB")
      await Promise.all(promises);
      console.log("DB Update successful")
      setSelected([]);


      // Update state from DB
      console.log("Updating UI from DB");
      refreshCabins();
      // updateCamperList();
    }
    // Handle Unsucc. db update
    catch {
      console.log("Something went wrong sending all to cabin");
      setSelected([]);
      refreshCabins();
      // updateCamperList()
    }
  }

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

  /** Unassign a single camper from a cabin
    * @param {string} cabinName Unique identifier for cabin
    * @param {camperSession} camper data about camper session
  */
  const unassignCamper = async (cabinIndex, camperIndex) => {
    // Eager UI Update
    const camper = { ...cabinSessions[cabinIndex].campers[camperIndex] };
    console.log({ camper });
    setAllCampers(c => {
      const updatedList = [...c.unassigned, camper];
      sortByAge(updatedList);
      return { unassigned: updatedList, all: c.all };

    });

    setCabinSessions(c => {
      const newCabinsList = [...c];
      newCabinsList[cabinIndex].campers.splice(camperIndex, 1);
      return newCabinsList;
    })

    // DB Action
    try {
      await assignCabin(camper);
      console.log("Update successful")
    } catch {
      console.log("Update Unsuccessful");
    }
    // Update from DB
    refreshCabins();
    // updateCampers();

  };

  /** Unassign all campers from cabins */
  const unassignAll = async () => {
    let campers = [...allCampers.unassigned];
    let newlyUnassignedCampers = [];
    let updatedCabinList = [...cabinSessions];
    for (let cabin of updatedCabinList) {
      const camperCopy = [...cabin.campers];
      newlyUnassignedCampers = newlyUnassignedCampers.concat(camperCopy);
      cabin.campers = [];
    }
    await Promise.all(newlyUnassignedCampers.map((c) => assignCabin(c, false)));
    const newUnassigned = [...campers, ...newlyUnassignedCampers];
    newUnassigned.sort((a, b) => a.age - b.age || a.lastName.localeCompare(b.name));
    setAllCampers(ac => ({ all: ac.all, unassigned: newUnassigned }));
    setCabinSessions(updatedCabinList);
    // Update from DB
    refreshCabins();
    // updateCampers();
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
            unassignCamper={unassignCamper}
            assign={sendAllToCabin}
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
