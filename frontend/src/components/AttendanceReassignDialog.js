import tw, { styled } from "twin.macro";
import "styled-components/macro";
import CloseIcon from '@mui/icons-material/Close';
import { Fab,Box,Badge, Typography, Fade } from "@mui/material";

const Dialog = styled.div(({ shouldDisplay }) => [
  tw`invisible opacity-0 transition-opacity`,
  shouldDisplay && tw`visible opacity-100`,
]);

          // <span tw=""> {selectedCampers.length} selected</span>
          // <button tw="bg-red-500 rounded shadow w-1/2 py-2" onClick={camperSelection.clear}>
          //   onClick={() => {
          //     if (selectedCampers.length > 0) {
          //       setDisplayModal(true);

const ReassignmentSelectionDialog = ({
  selectedCampers,
  camperSelection,
  setDisplayModal,
  displayModal
}) => {
  return (
    <>

      <Fade in={selectedCampers.length > 0 && !displayModal}>
      <Fab
    size="small"
    color="warning"
    onClick={camperSelection.clear}
      sx={{
        position:"fixed",
        bottom: 36,
        left: 32
      }}
    >
    <CloseIcon/>
    </Fab>
      </Fade>
      <Fade in={selectedCampers.length > 0 && !displayModal}>
      <Fab
    onClick={()=>{setDisplayModal(true)}}
    color="success"
      variant="extended"
      sx={{
        position:"fixed",
        bottom: 32,
        left: 92
      }}
      >
      Reassign {selectedCampers.length > 0 && selectedCampers.length}
      </Fab>
      </Fade>
    </>
  );
};

export default ReassignmentSelectionDialog;
