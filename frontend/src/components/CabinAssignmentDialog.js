import { Box,Select, Button, Dialog, DialogActions, DialogTitle, Grid, MenuItem, FormControl, FormControlLabel, InputLabel } from "@mui/material";
import { useContext, useState } from "react";
import WeekContext from "./WeekContext";

const CabinAssignmentDialog = ({open,onClose}) =>{
  const { weeks, WeekSelection, selectedWeek} = useContext(WeekContext);
  const [selectedArea,setSelectedArea]=useState("")
  const handleClose = () =>{
    onClose()
  }
  const handleSubmit = () =>{
    handleClose()
  }
  const handleChange = (e) =>{
    setSelectedArea(e.target.value);
  }

  const getUrl = () => {
    return `/cabins/assignment/${selectedArea}/${selectedWeek()?.number}`
  }

  return (<>
    {weeks.length > 0 &&
    <Dialog PaperProps={{elevation:8}} open={weeks && open} onClose={handleClose} fullWidth maxWidth="md" >
          <DialogTitle >Cabin Assignment Selection</DialogTitle>
    <Box  width={1} px={1} mb={1}>
      <Grid container width={1} alignItems="center" justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <WeekSelection />
        </Grid>
        <Grid item xs={6}>
      <FormControl fullWidth>
      <InputLabel >Area</InputLabel>
    <Select value={selectedArea} onChange={handleChange} label="Area">
    <MenuItem value="BA">BA</MenuItem>
    <MenuItem value="GA">GA</MenuItem>
    </Select>
      </FormControl>
        </Grid>
      </Grid>
    </Box>
    <DialogActions>
    <Button onClick={handleClose}>Nevermind</Button>
    <Button onClick={handleSubmit} disabled={!selectedWeek() && !selectedArea} href={getUrl()}>Go</Button>
    </DialogActions>
    </Dialog>
    }
  </>)
}

export default CabinAssignmentDialog;
