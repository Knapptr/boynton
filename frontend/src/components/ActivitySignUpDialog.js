import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from "./UserContext";
import WeekContext from "./WeekContext";

const ActivitySignUpDialog = ({ open, onClose }) => {
  const { weeks, selectedWeek, WeekSelection } = useContext(WeekContext);

  const auth = useContext(UserContext);
  const [cabins, setCabins] = useState([]);
  const [selectedCabinName, setSelectedCabinName] = useState("");

  const handleCabinSelectChange = (e) => {
    setSelectedCabinName(e.target.value);
  };

  useEffect(() => {
    const getCabins = async () => {
      const url = "/api/cabins";
      const response = await fetchWithToken(url, {}, auth);
      const data = await response.json();
      // Sort alpha
      data.sort((a,b)=>{
        return a.name.localeCompare(b.name, [], { numeric: true });
      })
      setCabins(data);
    };
    getCabins();
  }, [auth]);

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    handleClose();
  };

  const getUrl = () => {
    return `/schedule/sign-up/${selectedCabinName}/${selectedWeek()?.number}`;
  };

  return (
    <Dialog
      PaperProps={{ elevation: 8 }}
      open={weeks && open}
      onClose={onClose}
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography variant="subtitle2">Activity Sign Up</Typography>
        <Typography variant="h6" fontWeight="bold">
          Select Week & Cabin
        </Typography>
      </DialogTitle>
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
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cabin</InputLabel>
              <Select
                label="Cabin"
                value={selectedCabinName}
                onChange={handleCabinSelectChange}
              >
                {cabins.map((cabin) => (
                  <MenuItem value={cabin.name}>{cabin.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
          disabled={!selectedWeek() || selectedCabinName === ""}
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

export default ActivitySignUpDialog;
