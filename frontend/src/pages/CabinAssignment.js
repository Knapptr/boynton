import Campers from "../components/Campers";
import Cabins from "../components/Cabins";
import { Route } from "react-router-dom";
import { useState, useContext, useEffect, useCallback } from "react";
import UserContext from "../components/UserContext";
import { assignCabins } from "../requests/assignCabins";
import useCabinSessions from "../hooks/useCabinSessions";
import CabinAssignmentIndex from "./cabinAssignmentIndex";
import UnitHeadAccess from "../components/ProtectedUnitHead";
import { PropagateLoader } from "react-spinners";
import { PopOut } from "../components/styled";
import NotFound from "./NotFound";
import fetchWithToken from "../fetchWithToken";
import { Box } from "@mui/system";
import {
  Typography,
  Button,
  Skeleton,
  Grid,
  Stack,
  Drawer,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import Camper from "../components/Camper";
import CamperItem from "../components/CamperItem";

// CONSTANTS
const areas = ["ba", "ga"];
const weeks = ["1", "2", "3", "4", "5", "6"];

const drawerWidth = 1 / 3;

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
      <Route path="*" element={<NotFound />} />
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
  const {
    cabinSessions,
    refreshCabins,
    cabinList,
    updateCabinList,
    setCabinSessions,
    setCabinList,
  } = useCabinSessions(weekNumber, area);

  const [allCampers, setAllCampers] = useState({ unassigned: [], all: [] });

  const getCampers = useCallback(async () => {
    const response = await fetchWithToken(
      `/api/camper-weeks?week=${weekNumber}&area=${area}`,
      {},
      auth
    );
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
  }, [auth, area, weekNumber]);

  useEffect(() => {
    getCampers();
  }, [getCampers]);

  /** Check if all campers are assigned **/
  const allAssigned = () => {
    return allCampers.all.length > 0 && allCampers.unassigned.length === 0;
  };

  /** Add camper to selected campers
   * @param {camperSession} camper The camper to add to the selection
   */
  const selectCamper = (camper) => {
    setSelected((s) => [...s, {...camper}]);
  };

  const isSelected=(camper)=>{
    return selectedCampers.some(c=>c.id ===camper.id);
  }

  const handleSelect = (camper)=>{
    if(isSelected(camper)){
      deselectCamper(camper);
    }else{
      selectCamper(camper)
    }
  }
  /** Remove all selected campers from the unassigned list */
  const removeSelectedFromUnassigned = () => {
    // filter unassigned
    setAllCampers((campers) => {
      const updatedList = campers.unassigned.filter(
        (camper) => !selectedCampers.some((selCamp) => selCamp.id === camper.id)
      );
      return { all: campers.all, unassigned: updatedList };
    });
  };

  /** Remove a camper from the selected campers array
   * @param {number} sessionId The camper session id to remove from the list of selected campers*/
  const deselectCamper = (camper) => {
    setSelected((s) => {
      // remove id from array
      // maybe just use a set here?
      const index = s.findIndex((v) => v.id === camper.id);
      if (index === -1) {
        console.log(
          `Cannot deselect camper: ${camper.firstName}. They are not currently selected.`
        );
      } else {
        // set state to updated array
        const newState = [...s];
        newState.splice(index, 1);
        return newState;
      }
    });
  };

  /** Sort a list of campers by age IN PLACE
   * @param {camperSession[]} camperSessions The list of campers to be sorted
   */
  const sortByAge = (camperSessions) => {
    // should sort alpha by last name first ??
    // sort by age
    camperSessions.sort(
      (a, b) => a.age - b.age || a.lastName.localeCompare(b.lastName)
    );
  };
  /** Send camper to cabin on the DB
   * @param {camperSession} camperSession an object with a camperId and a session Id (id)
   * @param {string} cabinNumber (a unique cabin identifier)
   */
  const assignCabin = async (cabinSession) => {
    const camperSessions = [...selectedCampers];
    if (
      camperSessions.length >
      cabinSession.capacity - cabinSession.campers.length
    ) {
      console.log(
        "Handle this case: Not enough space for all selected campers"
      );
      return;
    }
    removeSelectedFromUnassigned();
    updateCabinUI(cabinSession.name, [...selectedCampers]);

    //clear selected
    setSelected([]);
    await assignCabins(cabinSession, camperSessions, auth);
    // Update state from DB
    refreshCabins();
    getCampers();
  };

  /** Push selected campers into cabin selection (optimistic UI update)
   * @param {string} cabinName Cabin name / number (the unique cabin identifier)
   * @param {campers[]} campers List of campers to be added to cabin
   */
  const updateCabinUI = (cabinName, campers) => {
    let targetIndex = cabinSessions.findIndex((c) => c.name === cabinName);
    const updatedList = [...cabinSessions];
    let targetCabin = updatedList.splice(targetIndex, 1)[0];
    if (targetCabin === undefined) {
      throw new Error("Something went wrong in Eager UI update");
    }
    targetCabin.campers = targetCabin.campers.concat(campers);
    sortByAge(targetCabin.campers);
    updatedList.splice(targetIndex, 0, targetCabin);
    setCabinSessions(updatedList);
  };

  const unassignReq = async (camperSessionId, cabinSessionId) => {
    const url = `/api/cabin-sessions/${cabinSessionId}/campers/${camperSessionId}`;
    const options = {
      method: "DELETE",
    };
    //Eager UI updates
    let camper = undefined;
    setCabinSessions((c) => {
      // remove from assigned
      console.log({oldState:c})
      const newState = [...c];
      const newCabinIndex = newState.findIndex(
        (cab) => cab.id === cabinSessionId
      );
      const newCabin = { ...newState[newCabinIndex] };
      const newCampers = [...newCabin.campers];
      console.log({oldCabin:newCabin});
      console.log({oldCampers:newCampers});
      const camperIndex = newCampers.find(
        (camper) => camper.id === camperSessionId
      );
      camper = newCampers.splice(camperIndex, 1)[0];
      newCabin.campers = newCampers;
      console.log({newCampers})
      console.log({newCabin})
      newState[newCabinIndex] = newCabin;
      console.log({newState})
      return newState.map(n=>n);
    });
    // add to unassigned
    setAllCampers((c) => {
      const updatedList = [...c.unassigned, camper];
      sortByAge(updatedList);
      return { unassigned: updatedList, all: c.all };
    });
    const result = await fetchWithToken(url, options, auth);
    // update from db
    refreshCabins();
    getCampers();
  };
  /** Unassign all campers from cabins */
  const unassignAll = async () => {
    // API req data
    const url = `/api/weeks/${weekNumber}/cabin-sessions/campers?area=${area.toUpperCase()}`;
    const options = { method: "DELETE" };
    // Eager UI update
    // Add all removed campers to unassigned
    let unassignedCampers = [...allCampers.unassigned];
    unassignedCampers = unassignedCampers.concat(
      ...cabinSessions.map((c) => c.campers)
    );
    sortByAge(unassignedCampers);
    setAllCampers((ac) => ({ ...ac, unassigned: unassignedCampers }));
    //remove all campers from cabins
    setCabinSessions((cs) => {
      return cs.map((c) => ({ ...c, campers: [] }));
    });
    // API Request
    const results = await fetchWithToken(url, options, auth);
    // Refresh page from DB
    refreshCabins();
    getCampers();
  };

  /** Show Both Cabins and Campers **/
  const showAll = () => {
    return <></>;
  };

  /** Display Cabins Only */
  const showOnlyCabins = () => {
    return (
      <div>
        <Box>
          <Cabins
            toggleUnassignModal={() => {
              selectedCampers={selectedCampers}
              setShowUnassignModal((d) => !d);
            }}
            unassign={unassignReq}
            showAllLists={cabinsOnly || allAssigned()}
          selectedCampers = {selectedCampers}
            cabinSessions={cabinSessions}
            cabinsOnly={true}
            weekNumber={weekNumber}
            area={area}
          />
        </Box>
      </div>
    );
  };

  return (
    <>
    <Dialog open={showUnassignModal}>
    <DialogTitle>Unassign All Campers?</DialogTitle>
    <DialogContent>
    <DialogContentText>This will unassign every {area.toUpperCase()} camper for Week {weekNumber}.</DialogContentText>
    <DialogContentText>Are you sure?</DialogContentText>
    <Stack direction="row">
    <Button color="success" onClick={()=>{setShowUnassignModal(false)}}>Nevermind.</Button><Button onClick={async()=>{ await unassignAll();
                    setShowUnassignModal(false);
    }}color="error">Yer outta there!</Button></Stack>
    </DialogContent>
    </Dialog>
      {/*
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

      */}
      <Box display="flex" width={1}>
        {/* keeps things nice*/}
        {/* Camper Drawer */}

        <Drawer
          variant="permanent"
          sx={{
            zIndex: 0,
            flexShrink: 0,
            width: drawerWidth,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Box mb={12} />
          <Stack>
            {allCampers.unassigned.map((camper, index) => 
              {{console.log("mapping",camper)}
              return <CamperItem 
              key={`camper-item-${camper.id}`}
              selectable
                index={index}
              handleSelect= {()=>{handleSelect(camper)}}
              isSelected={isSelected(camper)}
              onSelect={()=>{selectCamper(camper)}}
              onDeselect={()=>{deselectCamper(camper)}}
              camper={camper}
              />}
              /*<Camper
                full
                selectable
                key={`camper-${camper.id}`}
                index={index}
                select={selectCamper}
                deselect={deselectCamper}
                camper={camper}
              />*/
            )}
          </Stack>
        </Drawer>
        {/* MAIN ZONE */}
        <Box sx={{ flexGrow: 1 }}>
          <Box bgcolor="background.default" component="header" position="sticky" top={72} zIndex={3} sx={{ width: 1, mb: 3}}>
            <Grid container alignItems="center">
              <Grid container item xs={12} alignItems="center">
                <Grid item xs={6} md={3}>
                  <Typography variant="h6">
                    {area.toUpperCase()} Week {weekNumber}
                  </Typography>
                  <Typography variant="subtitle1">Cabin assignment</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Stack color="primary.main">
                    <Typography variant={{xs:"caption"}}>{allCampers.unassigned.length}</Typography>
                    <Typography variant="caption">Unassigned</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={3}>
                  <Stack color="primary.main">
                    <Typography variant="caption">{allCampers.all.length}</Typography>
                    <Typography variant="caption">Total</Typography>
                  </Stack>
                </Grid>
                <Grid 
sx={{display: {xs:"none",md:"block"}}}
    item xs={2}>
                  <Button
                    variant="outlined"
    size="small"
                    color="error"
                    onClick={() => {
                      if (true) {
                        setShowUnassignModal((d) => !d);
                      }
                    }}
                  >
                    Unassign All
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Box
                  color="primary.main"
                  sx={{
                    backgroundColor: "background.paper",
                  }}
                >
                  <Typography>
                    {!allAssigned() &&
                      `${selectedCampers.length} campers selected`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          {/*!allAssigned() && (
              <Button
                variant={cabinsOnly ? "contained" : "outlined"}
                color={cabinsOnly ? "success" : "warning"}
                onClick={() => {
                  toggleCabinsOnly();
                }}
              >
                {cabinsOnly && "Show Unassigned Campers"}
                {!cabinsOnly && "Show Cabins Only"}
              </Button>
            )*/}

          <Grid item xs={12}>
            <Cabins
              unassign={unassignReq}
              assign={assignCabin}
              toggleUnassignModal={() => {}}
              cabinsOnly={false}
              cabinSessions={cabinSessions}
    selectedCampers={selectedCampers}
              weekNumber={weekNumber}
              area={area}
            />
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default CabinAssignmentRoutes;
