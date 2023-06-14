import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import WeekContext from "./WeekContext";

const CabinListDialog = ({ open, onClose }) => {
  const {
    weeks,
    selectedWeek,
    WeekSelection,
  } = useContext(WeekContext);

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    handleClose();
  };

  const getUrl = () => {
    return `/cabins/list/${selectedWeek()?.number}`;
  };

  return (
    <Dialog
      PaperProps={{ elevation: 8 }}
      open={weeks && open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
    <Typography variant="subtitle2">Cabin Lists</Typography>
    <Typography variant="h6" fontWeight="bold">Select Week</Typography></DialogTitle>
      <Box width={1} px={1} mb={1}>
        <Grid
          container
          width={1}
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <WeekSelection />
          </Grid>
        </Grid>
      </Box>
      <DialogActions>
        <Button color="warning" variant="outlined" onClick={handleClose}>
          Nevermind
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedWeek()}
          href={getUrl()}
        >
          Go
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CabinListDialog;
