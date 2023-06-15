import { useContext, useState } from "react";
import { postCampersToActivity } from "../requests/activity";
import UserContext from "./UserContext";
import {
  Button,
    Container,
  Dialog,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

const ReassignModal = ({
  setDisplayModal,
  selectedCampers,
  camperSelection,
  updatePeriod,
  show,
  period,
}) => {
  const auth = useContext(UserContext);
  const [reassignmentOption, setReassignmentOption] = useState("");
  const reassignCampers = async () => {
    await postCampersToActivity(
      selectedCampers.map((c) => ({ ...c, camperSessionId: c.sessionId })),
      reassignmentOption,
      auth
    );
    updatePeriod();
    camperSelection.clear();
    setDisplayModal(false);
  };
  return (
    period && (
      <Dialog
        maxWidth="sm"
        fullWidth
        open={show}
        onClose={() => {
          setDisplayModal(false);
        }}
      >
        <DialogTitle>
          Reassign <em>{selectedCampers.length}</em> camper
          {selectedCampers.length > 1 ? "s" : ""}?
        </DialogTitle>
        <Container maxWidth="xs">
        <List dense>
          {selectedCampers.map((c, cIndex) => (
            <ListItem key={`reassignmentCamper-${cIndex}`}>
              <ListItemText>
                {c.firstName} {c.lastName}
              </ListItemText>
            </ListItem>
          ))}
        </List>
        <Divider color="primary" sx={{width:11/12, marginBottom:2}}/>
        <FormControl fullWidth >
        <InputLabel id="reassign-label">Reassign To</InputLabel>
        <Select
        labelId="reassign-label"
        label="Reassign To"
          value={reassignmentOption}
          onChange={(e) => {
            setReassignmentOption(Number.parseInt(e.target.value));
          }}
        >
          {period.activities
            .filter((a) => a.id !== "Unassigned")
            .map((a, aIndex) => {
              return (
                <MenuItem key={`reassign-option-${aIndex}`} value={a.sessionId}>
                  {a.name}
                </MenuItem>
              );
            })}
        </Select>
        </FormControl>

        </Container>
        <Stack direction="row" px={2} py={3} justifyContent="center" spacing={3}>
        <Button 
        color ="warning"
        variant="outlined"
        onClick={()=>{setDisplayModal(false)}}>
        Cancel
        </Button>
        <Button
            color="success"
        variant="contained"
          onClick={() => reassignCampers()}
        >
          Reassign
        </Button>
        </Stack>
      </Dialog>
    )
  );
};

export default ReassignModal;
