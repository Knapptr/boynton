import CloseIcon from '@mui/icons-material/Close';
import { Fab, Fade } from "@mui/material";

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
