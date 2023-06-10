import tw from "twin.macro";
import "styled-components/macro";
import { useNavigate } from "react-router-dom";
import catchErrors from "../utils/fetchErrorHandling";
import { Container, Autocomplete, Paper, TextField, Typography, Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { useState, useContext, useCallback, useEffect } from "react";
import { Box, Stack } from "@mui/system";
import UserContext from "../components/UserContext"
import fetchWithToken from "../fetchWithToken";
import usePops from "../hooks/usePops";


const CreateAward = () => {
  const navigate = useNavigate();
  const auth = useContext(UserContext);
  const { PopsBar, shamefulFailure, greatSuccess, clearPops } = usePops();

  // Form Data
  const initFields = { awardType: "", reason: "", }
  const [fields, setFields] = useState(initFields)
  const [textField, setTextField] = useState("");
  const [selectedField, setSelectedField] = useState([]);

  const clearForm = () => {
    setSelectedField([]);
    setTextField("");
    setFields(initFields);
  }

  // Requisite Data
  const [weeks, setWeeks] = useState([]);
  const [programAreas, setProgramAreas] = useState([]);
  const [campers, setCampers] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Fetch data on load
  const getData = useCallback(async () => {
    const weekResponse = fetchWithToken("/api/weeks", {}, auth);
    const programAreaResponse = fetchWithToken("/api/program-areas", {}, auth);
    const [weekRes, paRes] = await Promise.all([weekResponse, programAreaResponse]);
    const [weekData, paData] = await Promise.all([weekRes.json(), paRes.json()])
    setWeeks(weekData);
    setProgramAreas(paData);
  }, [auth])

  useEffect(() => {
    getData()
  }, [getData])


  // Fetch campers on Week Selection
  const getCampers = useCallback(async (week) => {
    setCampers(null);
    const response = await fetchWithToken(`/api/weeks/${week.number}/campers`, {}, auth)
    const camperData = await response.json()
    setCampers(camperData);
  }, [auth])

  useEffect(() => {
    if (selectedWeek) {
      getCampers(selectedWeek);
    }
  }, [selectedWeek])

  const handleWeekSelect = ((e, selectedWeek) => {
    setSelectedWeek(selectedWeek)
  })
  const handleFormChange = (event) => {
    setFields(o => ({ ...o, [event.target.name]: event.target.value }))
  }


  const handleFormSubmit = async () => {
    if (selectedField.length > 0 && fields.awardType && fields.reason) {
      clearPops();
      const url = "/api/awards";
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awards: selectedField.map(camper => ({ camperSessionId: camper.sessionId, reason: fields.reason, programAreaId: fields.awardType })) })
      }
      const response = await fetchWithToken(url, options, auth);
      const results = await catchErrors(response, (e) => { shamefulFailure("Shame!", e.message) });
      if (results) {
        console.log({ results });
        greatSuccess("Nice!", `You just gave ${selectedField.length} award(s)`);
        //clear box for more
        clearForm();

      }
    }
  }

  return <>
    <Box>
      <Stack direction="row" justifyContent="center" flexWrap="wrap" alignItems="center" width={1}>
        <Typography variant="h5" marginX={4} component="h3">Select Week</Typography>
        <ToggleButtonGroup onChange={handleWeekSelect} value={selectedWeek} exclusive>
          {weeks && weeks.map(w => (
            <ToggleButton key={`week-select-${w.number}`} tw="bg-green-600 hover:bg-green-400" value={w}>{w.number}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

    </Box>
    <Container maxWidth="md" tw="mt-8">
      {selectedWeek && campers &&
        <Paper tw="py-4" elevation={4} >
          <Box component="header">
            <Typography variant="h4" component="h1">Give an Award</Typography>
            <Typography variant="h6" component="h2">A Camper really excelled.</Typography>
            <Typography variant="h6" component="h2"> Celebrate their achievement! </Typography>
          </Box>
          <Stack tw="px-4 py-2" spacing={2}>
            <Autocomplete
              multiple
              options={campers}
              getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName}`}
              value={selectedField}
              onChange={((e, list) => {
                setSelectedField(list);
              })}
              inputValue={textField}
              onInputChange={(e, value) => {
                setTextField(value);
              }}
              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Camper(s)" label="Awarded To" />}
            />
            <Box component="div">
              <Typography variant="subtitle2" component="p">You may award multiple campers the same award. You do not need to submit 1 form per camper.</Typography>
            </Box>
            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
              <TextField label="Awarded For" name="reason" onChange={handleFormChange} value={fields.reason} variant="outlined" tw="w-full" />
              <FormControl tw="w-full">
                <InputLabel id="awardTypeSelect" > Award Type </InputLabel>
                <Select
                  labelId="awardTypeSelect"
                  label="Award Type"
                  name="awardType"
                  id="awardTSelect"
                  onChange={handleFormChange}
                  value={fields.awardType}
                  tw="w-full text-left"
                >
                  {programAreas.map(a => {
                    return <MenuItem key={`program-area-${a.id}`} value={a.id}>{a.name}</MenuItem>
                  })}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
          <Box>
            <button onClick={handleFormSubmit} tw="bg-green-600 rounded p-3 text-white font-bold">Award!</button>
          </Box>
        </Paper>}
      <PopsBar />
    </Container>
  </>
}

export default CreateAward
