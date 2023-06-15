import {
  Dialog,
  Stack,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ToggleSelector from "./Selector";

const SelectDayPeriod = ({
  open,
  onClose,
  days,
  currentDay,
  currentPeriod,
  week,
  cabin,
  onSubmit
}) => {
  const [fields, setFields] = useState({
    day: currentDay,
    period: currentPeriod,
  });

  const handleSubmit = () =>{
    console.log({onSubmit})
   onSubmit(fields) 
  onClose()
  }
  const handleClose = () => {
    onClose();
    setFields({ day: currentDay, period: currentPeriod });
  };
  const handlePeriodChange = (index) => {
    setFields((f) => ({ ...f, period: index }));
  };
  const handleDayChange = (index) => {
    // Handle period overage on day change
    const period =
      days[index].periods.length <
      days[fields.day].periods.length
        ? days[index].periods.length - 1
        : fields.period;
    console.log({period})
    setFields({ day: index, period });
  };

  const getPeriodOptions = () => {
    return days[fields.day].periods;
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
    Select Day / Activity Period
    <br/>
    <Typography variant="subtitle2">Week {week.display} - Cabin {cabin}</Typography>
    </DialogTitle>
      <DialogContent>
        <Stack spacing={2} w={1} display="flex" justifyContent="center">
          <ToggleSelector
            list={days.map((d) => ({ ...d, label: d.name }))}
            selectedItem={fields.day}
            onChange={handleDayChange}
          />
          <Divider />
          <ToggleSelector
            list={getPeriodOptions().map((p) => ({
              ...p,
              label: `Act ${p.number}`,
            }))}
            onChange={handlePeriodChange}
            selectedItem={fields.period}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="warning">Cancel</Button>
        <Button onClick={handleSubmit} color="success">Go</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectDayPeriod;
