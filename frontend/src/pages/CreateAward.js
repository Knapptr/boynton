import { useNavigate, useParams } from "react-router-dom";
import catchErrors from "../utils/fetchErrorHandling";
import {
  Container,
  Autocomplete,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from "@mui/material";
import { useState, useContext, useCallback, useEffect } from "react";
import { Box, Stack } from "@mui/system";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import usePops from "../hooks/usePops";
import useWeeks from "../hooks/useWeeks";
import WeekContext from "../components/WeekContext";

const CreateAward = () => {
  const { weekNumber } = useParams();
  const { getWeekByNumber } = useContext(WeekContext);

  const currentWeek = getWeekByNumber(Number.parseInt(weekNumber)) 

  const auth = useContext(UserContext);
  const { PopsBar, shamefulFailure, greatSuccess, clearPops } = usePops();

  // Form Data
  const initFields = { awardType: "", reason: "" };
  const [fields, setFields] = useState(initFields);
  const [textField, setTextField] = useState("");
  const [selectedField, setSelectedField] = useState([]);

  const clearForm = () => {
    setSelectedField([]);
    setTextField("");
    setFields(initFields);
  };

  // Requisite Data
  const [programAreas, setProgramAreas] = useState([]);
  const [campers, setCampers] = useState([]);

  // Fetch data on load
  const getData = useCallback(async () => {
    const programAreaResponse = fetchWithToken("/api/program-areas", {}, auth);
    const paRes = await programAreaResponse;
    const paData = await paRes.json();

    setProgramAreas(paData);
  }, [auth]);

  useEffect(() => {
    getData();
  }, [getData]);

  // Fetch campers on Week Selection
  const getCampers = useCallback(
    async () => {
      setCampers(null);
      const response = await fetchWithToken(
        `/api/weeks/${weekNumber}/campers`,
        {},
        auth
      );
      const camperData = await response.json();
      setCampers(camperData);
    },
    [auth]
  );

  useEffect(() => {
      getCampers(currentWeek);
  }, [getCampers]);

  const handleFormChange = (event) => {
    setFields((o) => ({ ...o, [event.target.name]: event.target.value }));
  };

  const handleFormSubmit = async () => {
    if (selectedField.length > 0 && fields.awardType && fields.reason) {
      clearPops();
      const url = "/api/awards";
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awards: selectedField.map((camper) => ({
            camperSessionId: camper.sessionId,
            reason: fields.reason,
            programAreaId: fields.awardType,
          })),
        }),
      };
      const response = await fetchWithToken(url, options, auth);
      const results = await catchErrors(response, (e) => {
        shamefulFailure("Shame!", e.message);
      });
      if (results) {
        console.log({ results });
        greatSuccess("Nice!", `You just gave ${selectedField.length} award(s)`);
        //clear box for more
        clearForm();
      }
    }
  };

  return (
    <>
      <Container maxWidth="md">
        {currentWeek && campers && (
          <Paper elevation={4} sx={{ paddingY: 4, paddingX: 2, mt:2 }}>
            <Box component="header">
          <Typography variant="h6" component="h1">Week {currentWeek.display} </Typography>
          <Typography variant="h5" component="h1"><em>{currentWeek.title}</em> </Typography>
              <Typography variant="body1" component="h2">
                A Camper really excelled. Celebrate their achievement!
              </Typography>
              <Typography mt={2} variant="subtitle2" color="gray" component="p">
                You may award multiple campers the same award. You do not need
                to submit 1 form per camper.
              </Typography>
            </Box>
            <Box
              sx={{
                mb: 4,
                width: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Autocomplete
                multiple
                sx={{ width: 11 / 12 }}
                options={campers}
                getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName}`}
                value={selectedField}
                onChange={(e, list) => {
                  setSelectedField(list);
                }}
                inputValue={textField}
                onInputChange={(e, value) => {
                  setTextField(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Camper(s)"
                    label="Awarded To"
                  />
                )}
              />
            </Box>
            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
              <TextField
                label="Awarded For"
                name="reason"
                onChange={handleFormChange}
                value={fields.reason}
                variant="outlined"
                sx={{ width: 1 }}
              />
              <FormControl fullWidth>
                <InputLabel id="awardTypeSelect"> Award Type </InputLabel>
                <Select
                  labelId="awardTypeSelect"
                  label="Award Type"
                  name="awardType"
                  id="awardTSelect"
                  onChange={handleFormChange}
                  value={fields.awardType}
                >
                  {programAreas.map((a) => {
                    return (
                      <MenuItem key={`program-area-${a.id}`} value={a.id}>
                        {a.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Stack>
            <Box marginTop={4}>
              <Button
                onClick={handleFormSubmit}
                variant="contained"
                color="success"
              >
                Award!
              </Button>
            </Box>
          </Paper>
        )}
        <PopsBar />
      </Container>
    </>
  );
};

export default CreateAward;
