import Cabins from "../components/Cabins";
import { Route } from "react-router-dom";
import { useState, useContext, useEffect, useCallback } from "react";
import UserContext from "../components/UserContext";
import { assignCabins } from "../requests/assignCabins";
import useCabinSessions from "../hooks/useCabinSessions";
import CabinAssignmentIndex from "./cabinAssignmentIndex";
import UnitHeadAccess from "../components/ProtectedUnitHead";
import NotFound from "./NotFound";
import fetchWithToken from "../fetchWithToken";
import {
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import CamperItem from "../components/CamperItem";
import WeekContext from "../components/WeekContext";
import { Helmet } from "react-helmet";
import usePops from "../hooks/usePops";

// CONSTANTS
const areas = ["ba", "ga"];
const weeks = ["1", "2", "3", "4", "5", "6"];
const drawerWidth = 1 / 3;
const marginSize = 56;

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
  const {getWeekByNumber} = useContext(WeekContext);

  const currentWeek = getWeekByNumber(Number.parseInt(weekNumber));

  const [showUnassignModal, setShowUnassignModal] = useState(false);
  // const [cabinsOnly, setCabinsOnly] = useState(false);
  const [selectedCampers, setSelected] = useState([]);


  // /** Toggle the visibility of campers / cabins */
  // const toggleCabinsOnly = () => {
  //   setCabinsOnly((s) => !s);
  // };

  const {
    cabinSessions,
    refreshCabins,
    setCabinSessions,
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
    setSelected((s) => [...s, { ...camper }]);
  };

  const isSelected = (camper) => {
    return selectedCampers.some((c) => c.id === camper.id);
  };

  const handleSelect = (camper) => {
    clearPops();
    if (isSelected(camper)) {
      deselectCamper(camper);
    } else {
      selectCamper(camper);
    }
  };
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
    clearPops();
    const camperSessions = [...selectedCampers];
    if (
      camperSessions.length >
      cabinSession.capacity - cabinSession.campers.length
    ) {
      shamefulFailure("SHAME!",`that cabin can't fit ${camperSessions.length} more campers`)
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
      const newState = [...c];
      const newCabinIndex = newState.findIndex(
        (cab) => cab.id === cabinSessionId
      );
      const newCabin = { ...newState[newCabinIndex] };
      const newCampers = [...newCabin.campers];
      const camperIndex = newCampers.find(
        (camper) => camper.id === camperSessionId
      );
      camper = newCampers.splice(camperIndex, 1)[0];
      newCabin.campers = newCampers;
      newState[newCabinIndex] = newCabin;
      return newState.map((n) => n);
    });
    // add to unassigned
    setAllCampers((c) => {
      const updatedList = [...c.unassigned, camper];
      sortByAge(updatedList);
      return { unassigned: updatedList, all: c.all };
    });
  await fetchWithToken(url, options, auth);
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
    await fetchWithToken(url, options, auth);
    // Refresh page from DB
    refreshCabins();
    getCampers();
  };

  /** Show Both Cabins and Campers **/
  // const showAll = () => {
  //   return <></>;
  // };

  /** Display Cabins Only */
  // const showOnlyCabins = () => {
  //   return (
  //     <div>
  //       <Box>
  //         <Cabins
  //           toggleUnassignModal={() => {
  //             selectedCampers = { selectedCampers };
  //             setShowUnassignModal((d) => !d);
  //           }}
  //           unassign={unassignReq}
  //           showAllLists={cabinsOnly || allAssigned()}
  //           selectedCampers={selectedCampers}
  //           cabinSessions={cabinSessions}
  //           cabinsOnly={true}
  //           weekNumber={weekNumber}
  //           area={area}
  //         />
  //       </Box>
  //     </div>
  //   );
  // };
const {PopsBar,shamefulFailure,clearPops} = usePops()
  return currentWeek && (
    <>
    <Helmet><title>Cabin Assignment</title></Helmet>
    
  <PopsBar />
      <Dialog open={showUnassignModal}>
        <DialogTitle>Unassign All Campers?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will unassign every {area.toUpperCase()} camper for Week{" "}
            {currentWeek.display}.
          </DialogContentText>
          <DialogContentText>Are you sure?</DialogContentText>
          <Stack direction="row">
            <Button
              color="success"
              onClick={() => {
                setShowUnassignModal(false);
              }}
            >
              Nevermind.
            </Button>
            <Button
              onClick={async () => {
                await unassignAll();
                setShowUnassignModal(false);
              }}
              color="error"
            >
              Yer outta there!
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
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
              backgroundColor: "background.primary.light"
            },
          }}
        >
          <Box mb={10} />
          <Stack spacing={0.5} pb={4}>
            {allCampers.unassigned.map(
              (camper, index) => {
                return (
                  <CamperItem
                    key={`camper-item-${camper.id}`}
                    selectable
                    index={index}
                    handleSelect={() => {
                      handleSelect(camper);
                    }}
                    isSelected={isSelected(camper)}
                    onSelect={() => {
                      selectCamper(camper);
                    }}
                    onDeselect={() => {
                      deselectCamper(camper);
                    }}
                    camper={camper}
                  />
                );
              }
            )}
          </Stack>
        </Drawer>
        {/* MAIN ZONE */}
        <Box sx={{ flexGrow: 1 }}>
          <Box
            bgcolor="background.default"
            component="header"
            position="sticky"
            top={marginSize}
            zIndex={3}
            sx={{ width: 1, mb: 3 }}
          >
            <Grid container alignItems="center">
              <Grid container item xs={12} alignItems="center">
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Cabin assignment</Typography>
                  <Typography variant="h6">
                    {area.toUpperCase()} Week {currentWeek.display}
                  </Typography>
    <Typography fontSize="0.5rem" variant="subtitle1">{currentWeek.title}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Stack color="primary.main">
                    <Typography variant={"caption" }>
                      {allCampers.unassigned.length}
                    </Typography>
                    <Typography variant="caption">Unassigned</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={3}>
                  <Stack color="primary.main">
                    <Typography variant="caption">
                      {allCampers.all.length}
                    </Typography>
                    <Typography variant="caption">Total</Typography>
                  </Stack>
                </Grid>
                <Grid sx={{ display: { xs: "none", md: "block" } }} item xs={2}>
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

          <Grid px={0.4} item xs={12}>
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
