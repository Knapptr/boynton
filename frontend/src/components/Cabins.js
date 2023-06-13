import { useEffect, useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import Cabin from "./Cabin";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { AssignmentHeader } from "./styled";
import { PropagateLoader } from "react-spinners";
import {
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
  Skeleton,
  IconButton,
  Typography,
} from "@mui/material";


const Button = styled.button(() => [tw`bg-green-600 rounded text-white p-2`]);
const UnassignButton = styled.button(({ anyAssignments }) => [
  tw`bg-coolGray-300 py-2 px-3 rounded`,
  anyAssignments && tw`bg-red-500`,
]);
const Cabins = ({
  showAllLists,
  assign,
  cabinSessions,
  toggleUnassignModal,
  selectedCampers,
  cabinsOnly,
  unassign,
}) => {
  //const [hideFull, setHideFull] = useState(false);

  const displayCabins = () => {
    let list = [...cabinSessions];
    // if (hideFull) {
    //   list = cabinSessions.filter(
    //     (cabin) => cabin.capacity > cabin.campers.length
    //   );
    // }
    return list.map((cabinSession, index) => {
      return (
        <Grid item xs={12} md={4}>
        <Cabin
          cabinsOnly={cabinsOnly}
          assign={assign}
        selectedCampers = {selectedCampers}
          key={`cabin-${cabinSession.name}`}
          unassignCamper={(camperSessionId) =>
            unassign(camperSessionId, cabinSession.id)
          }
          allOpenState={showAllLists}
          session={cabinSession}
        />
        </Grid>
      );
    });
  };
  return (
    <>
    {/*
      <Box variant="header">
      <Box>
      <FormGroup>
      <FormControlLabel
      checked={hideFull}
      onChange={() => {
        setHideFull((f) => !f);
      }}
      label="Hide Full"
      control={<Checkbox />}
      />
      </FormGroup>
      </Box>
      </Box>
    */}
      <Grid container gap={3} justifyContent="center">
        {cabinSessions.length === 0 && <Skeleton variant="rectangular" />}
        {displayCabins()}
      </Grid>
    </>
  );
};

export default Cabins;
