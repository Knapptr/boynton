import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import { Link, Outlet } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw from "twin.macro";
import "styled-components/macro";
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
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

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

// export const CamperItem = styled.li(({ dayCamp, fl }) => [
//     tw`bg-green-100 flex justify-start `,
//     dayCamp && tw`bg-yellow-200`,
//     fl && tw`bg-orange-200`
// ]);

const CamperItem = ({ camper }) => {
  const camperBadges = (camper) => {
    const badges = [
      { type: "dayCamp", label: "day" },
      { type: "fl", label: "FL" },
      { type: "pronouns", label: camper.pronouns },
    ];

    const activeBadges = badges.filter((badge) => camper[badge.type]);
    console.log({ camper });
    console.log({ activeBadges });
    return activeBadges;
  };
  return (
    <Box
      sx={{
        "&:nth-child(odd)": { backgroundColor: "background.main" },
        "&:nth-child(even)": { backgroundColor: "background.alt" },
      }}
      py={0.75}
      px={1}
      textAlign="left"
      key={`camper-${camper.id}`}
    >
      <Typography>
        {camper.firstName} {camper.lastName} <em>{camper.age}</em>
      </Typography>
      <Stack direction="row" justifyContent="start">
        {camperBadges(camper).map((badge) => (
          <Chip size="small" label={badge.label} />
        ))}
      </Stack>
      <Divider variant="inset" />
    </Box>
  );
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
            cabin.campers.map((camper) => <CamperItem camper={camper} />)}
        </Stack>
      </Card>
    </>
  );
};
const CabinListIndex = () => {
  const { weeks, selectedWeek, WeekSelection, isSelected } = useWeeks();

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
  /** Handle the selection of a week  */
  useEffect(() => {
    if (selectedWeek() !== null) {
      /** Fetch cabin-sessions from api Defined here because of useEffect dependencies */
      const getCabinSessions = async () => {
        const csResponse = await fetchWithToken(
          `/api/cabin-sessions?week=${selectedWeek().number}`,
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
          `/api/camper-weeks?week=${selectedWeek().number}&cabin=unassigned`,
          {},
          auth
        );
        const unassigned = await ucResponse.json();
        setUnassignedCampers(unassigned);
      };
      getCabinSessions();
      getUnassignedCampers();
    }
  }, [selectedWeek, auth]);

  const [showAccordion, setShowAccordion] = useState(selectedWeek() === null);
  const handleAccordionChange = (e, state) => {
    setShowAccordion(state);
  };

  useEffect(() => {
    if (selectedWeek()) {
      setShowAccordion(false);
    }
  }, [selectedWeek]);
  return (
    <>
      <Accordion
        sx={{ width: 1 }}
        expanded={showAccordion}
        onChange={handleAccordionChange}
      >
        <AccordionSummary
          expandIcon={
            selectedWeek() === null? (
              <></>
            ) : (
              <ExpandMoreIcon />
            )
          }
    >
          {selectedWeek() ? (
            <>
              <Box width={1}>
                <Typography variant="h6">{selectedWeek().title}</Typography>
                <Typography variant="body2">
                  Week {selectedWeek().number}
                </Typography>
              </Box>
            </>
          ) : (
            <Box width={1}>
              <Typography variant="h6">Select Week</Typography>
            </Box>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <WeekSelection />
        </AccordionDetails>
      </Accordion>

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
              md={selected.cabins.length > 1 ? 4 : 12}
              lg={selected.cabins.length > 1 ? 6 : 12}
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
            md={selected.cabins.length > 1 ? 4 : 12}
            lg={selected.cabins.length > 1 ? 6 : 12}
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
// {unassignedCampers.map(camper => (
//   < CamperItem dayCamp={camper.dayCamp} key={`camper-${camper.sessionId}`} fl={camper.fl} >
//     <CamperCol>
//       <span tw="text-sm">{camper.firstName} {camper.lastName} </span>
//       <span > {camper.age}</span>
//     </CamperCol>
//     {camper.dayCamp &&
//       <CamperCol>
//         <span tw="text-sm">{" "}day</span>
//       </CamperCol>}
//     {camper.fl &&
//       <CamperCol>
//         <span tw="text-sm">{" "}fl</span>
//       </CamperCol>
//     }
//     <CamperCol>
//       {camper.pronouns && <PronounBadge tw="text-sm">{camper.pronouns.toLowerCase()}</PronounBadge>}
//     </CamperCol>

//   </CamperItem>
// ))}
