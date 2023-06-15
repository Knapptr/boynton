import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import { Link, Outlet, useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MenuSelector } from "../components/styled";
import fetchWithToken from "../fetchWithToken";
import sortCabins from "../sortCabins";
import useWeeks from "../hooks/useWeeks";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CamperItem from "../components/CamperItem";
import WeekContext from "../components/WeekContext";
import { Helmet } from "react-helmet";

/** A helper to deal with the cabin list */
const cabinSelections = {
  all: (cabinSessions) => ({ selectionName: "ALL", cabins: cabinSessions }),
  ba: (cabinSessions) => ({
    selectionName: "BA",
    cabins: cabinSessions.filter((c) => c.area === "BA").sort(sortCabins),
  }),
  ga: (cabinSessions) => ({
    selectionName: "GA",
    cabins: cabinSessions.filter((c) => c.area === "GA").sort(sortCabins),
  }),
  single: (cabin) => ({ selectionName: cabin.name, cabins: [cabin] }),
  unassigned: (unassignedCampers) => ({
    selectionName: "UNASSIGNED",
    cabins: [{ name: "Unassigned", campers: unassignedCampers }],
  }),
  none: () => ({ selectionName: "NONE", cabins: [] }),
};

const CabinListItem = ({ cabin }) => {
  return (
    <>
      <Box
        bgcolor="primary.light"
        component="header"
        position="sticky"
        top={72}
        width={1}
      >
        <Typography variant="h5" py={0.5}>
          {cabin.name}
        </Typography>
      </Box>
      <Card elevation={2}>
        <Stack>
          {cabin &&
            cabin.campers.map((camper,index) => <CamperItem index={index} camper={camper} />)}
        </Stack>
      </Card>
    </>
  );
};

const CabinListIndex = () => {
  const {getWeekByNumber} = useContext(WeekContext)
  const {weekNumber} = useParams();

  const currentWeek = getWeekByNumber(Number.parseInt(weekNumber));

  const [cabinSessions, setCabinSessions] = useState([]);

  const [selected, setSelected] = useState(cabinSelections.none());

  const [unassignedCampers, setUnassignedCampers] = useState([]);

  const auth = useContext(UserContext);
  /** Select cabin */
  const selectCabin = (selection) => {
    setSelected((s) => selection);
  };

  /**Get amount of current cabins */
  const getCabinDisplayCount = () => {
    // This weird conditional handles the "Has no campers assigned" text. It's a quick fix.
    if (
      (selected.selectionName === "GA" || selected.selectionName === "BA") &&
      selected.cabins.every((c) => c.campers.length === 0)
    ) {
      return 1;
    }
    return selected.cabins.length;
  };

  /** get list on page load*/
  useEffect(() => {
      /** Fetch cabin-sessions from api Defined here because of useEffect dependencies */
      const getCabinSessions = async () => {
        const csResponse = await fetchWithToken(
          `/api/cabin-sessions?week=${weekNumber}`,
          {},
          auth
        );
        const cabinSessionsResponse = await csResponse.json();
        // group by area
        cabinSessionsResponse.sort((a, b) => {
          return a.name.localeCompare(b.name, [], { numeric: true });
        });

        setSelected(cabinSelections.all(cabinSessionsResponse));
        setCabinSessions(cabinSessionsResponse);
      };

      /** Fetch unassigned Campers. Defined here because of useEffect dependencies */
      const getUnassignedCampers = async () => {
        // unpopulatel list to avoid display conflicts
        setUnassignedCampers([]);
        const ucResponse = await fetchWithToken(
          `/api/camper-weeks?week=${weekNumber}&cabin=unassigned`,
          {},
          auth
        );
        const unassigned = await ucResponse.json();
        setUnassignedCampers(unassigned);
      };
      getCabinSessions();
      getUnassignedCampers();
  }, [auth]);

  return (
    <>
    <Helmet>
    <title>Cabin List</title>
    </Helmet>
    <Typography variant="subtitle1" component="h1">Cabin List</Typography>
    <Typography variant="h6" component="h1">Week {currentWeek?.display}</Typography>
    <Typography variant="subtitle1" component="h1"><em>{currentWeek?.title}</em></Typography>

      {cabinSessions.length > 0 && (
        <ToggleButtonGroup
          sx={{
            displayPrint: "none",
            display: "flex",
            flexWrap: "wrap",
            marginBottom: 2,
          }}
          value={selected.selectionName}
        >
          <ToggleButton
            onClick={() => selectCabin(cabinSelections.all(cabinSessions))}
            selected={selected.selectionName === "ALL"}
            value="ALL"
          >
            All
          </ToggleButton>
          <ToggleButton
            onClick={() => selectCabin(cabinSelections.ba(cabinSessions))}
            selected={selected.selectionName === "BA"}
            value="BA"
          >
            BA
          </ToggleButton>
          <ToggleButton
            onClick={() => selectCabin(cabinSelections.ga(cabinSessions))}
            selected={selected.selectionName === "GA"}
            value="GA"
          >
            GA
          </ToggleButton>
          {cabinSessions.map((cabin) => (
            <ToggleButton
              onClick={() => selectCabin(cabinSelections.single(cabin))}
              selected={selected.selectionName === cabin.name}
              key={`selector-cabin-${cabin.name}`}
              value={cabin.name}
            >
              {cabin.name}
            </ToggleButton>
          ))}
          {unassignedCampers.length > 0 && (
            <ToggleButton
              onClick={() =>
                selectCabin(cabinSelections.unassigned(unassignedCampers))
              }
              selected={selected.selectionName === "unassigned"}
              value="unassigned"
            >
              Unassigned
            </ToggleButton>
          )}
        </ToggleButtonGroup>
      )}

      <Grid container px={0.5} spacing={1} justifyContent="center">
        {selected.selectionName !== "ALL" &&
          selected.selectionName !== "NONE" &&
          selected.cabins.every((c) => c.campers.length === 0) && (
            <Grid item xs={12}>
              <span>
                {selected.selectionName} has no assigned Campers. Either cabins
                have not been assigned, or it is empty this week.
              </span>
            </Grid>
          )}
        {selected.cabins
          .filter((c) => c.campers.length > 0)
          .map((cabin) => (
            <Grid
              item
              xs={12}
              sm={selected.cabins.length > 1 ? 6 : 12}
              md={selected.cabins.length > 1 ? 3 : 12}
              lg={selected.cabins.length > 1 ? 2 : 12}
            >
              <CabinListItem key={`cabin-list-${cabin.name}`} cabin={cabin} />
            </Grid>
          ))}
        {/* UNASSIGNED CAMPERS */}
        {selected.selectionName === "ALL" && unassignedCampers.length > 0 && (
          <Grid
            item
            xs={12}
            sm={selected.cabins.length > 1 ? 6 : 12}
            md={selected.cabins.length > 1 ? 3 : 12}
            lg={selected.cabins.length > 1 ? 2 : 12}
          >
            <CabinListItem
              cabin={{ name: "Unassigned", campers: unassignedCampers }}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default CabinListIndex;
