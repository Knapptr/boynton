import { Box, Button, Dialog, DialogActions, DialogTitle, Grid } from "@mui/material";
import useWeeks from "../hooks/useWeeks";

const AttendanceDialog = ({ open,onClose }) => {
  const { weeks,selectedPeriod, WeekSelection, DaySelectDropdown, PeriodSelectDropdown, allSelected } =
    useWeeks();
  const handleClose = () =>{
    onClose()
  }
  const handleSubmit = () =>{
    handleClose()
  }

  const getUrl = () => {
    return `/schedule/attendance/${selectedPeriod()?.id}`
  }

  return (
    <Dialog PaperProps={{elevation:8}} open={weeks && open} onClose={onClose} fullWidth maxWidth="md" >
          <DialogTitle >Select Period</DialogTitle>
    <Box  width={1} px={1} mb={1}>
      <Grid container width={1} alignItems="center" justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <WeekSelection />
        </Grid>
        <Grid item xs={7}>
          <DaySelectDropdown />
        </Grid>
        <Grid item xs={7}>
          <PeriodSelectDropdown />
        </Grid>
      </Grid>
    </Box>
    <DialogActions>
    <Button onClick={handleClose}>Nevermind</Button>
    <Button onClick={handleSubmit} disabled={!selectedPeriod()} href={getUrl()}>Go</Button>
    </DialogActions>
    </Dialog>
  );
};

export default AttendanceDialog;
