import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import WeekContext from "./WeekContext";

const AttendanceDialog = ({ open, onClose }) => {
  const {
    weeks,
    selectedPeriod,
    WeekSelection,
    DaySelectDropdown,
    PeriodSelectDropdown,
  } = useContext(WeekContext);

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    handleClose();
  };

  const getUrl = () => {
    return `/schedule/attendance/${selectedPeriod()?.id}`;
  };

  return (
    <Dialog
      PaperProps={{ elevation: 8 }}
      open={weeks && open}
      onClose={onClose}
    sx={{maxWidth: 400, mx:"auto"}}
    >
      <DialogTitle component="div">
    <Typography variant="subtitle2" component="h5">Attendance</Typography>
    <Typography variant="h6" fontWeight="bold">Select Period</Typography></DialogTitle>
      <Box width={1}  px={1} mb={1}>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <WeekSelection />
          </Grid>
          <Grid item xs={6}>
            <DaySelectDropdown />
          </Grid>
          <Grid item xs={6}>
            <PeriodSelectDropdown />
          </Grid>
        </Grid>
      </Box>
      <DialogActions>
    <Stack direction="row" spacing={2}>
        <Button color="warning" variant="outlined" onClick={handleClose}>
          Nevermind
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedPeriod()}
          href={getUrl()}
    color="primary"
    variant="contained"
        >
          Go
        </Button>
    </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceDialog;
