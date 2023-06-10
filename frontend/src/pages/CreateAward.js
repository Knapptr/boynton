import tw from "twin.macro";
import "styled-components/macro";
import { useNavigate } from "react-router-dom";
import catchErrors from "../utils/fetchErrorHandling";
import { Button, Container, Autocomplete, Paper, TextField, Typography, Select, MenuItem, FormControl, InputLabel, CssBaseline, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { useState, useContext, useCallback, useEffect } from "react";
import { Box, Stack } from "@mui/system";
import UserContext from "../components/UserContext"
import fetchWithToken from "../fetchWithToken";
import useErrors from "../hooks/useErrors";

const CAMPER_OPTIONS = [{ id: 1, label: "Tyler" }, { id: 2, label: "Anja" }, { id: 3, label: "Sokhna" }]
const PROGRAM_AREAS = ["Challenge Activities", "Archery", "Ropes", "Waterfront", "Polar Bear Dip", "Creative Arts", "Superstar"]

const CreateAward = () => {
  const navigate = useNavigate();
  const auth = useContext(UserContext);
  const { errors, setErrors, thereAreErrors, ErrorsBar, clearErrors } = useErrors();

  // Form Data
  const [fields, setOptions] = useState({

  })
  const [textField, setTextField] = useState("");
  const [selectedField, setSelectedField] = useState([]);


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
    setOptions(o => ({ ...o, [event.target.name]: event.target.value }))
  }

  const handleFormSubmit = async () => {
    if (selectedField.length > 0 && fields.programAreaId && fields.reason) {
      clearErrors();
      const url = "/api/awards";
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awards: selectedField.map(camper => ({ camperSessionId: camper.sessionId, reason: fields.reason, programAreaId: fields.programAreaId })) })
      }
      const response = await fetchWithToken(url, options, auth);
      const results = await catchErrors(response, (e) => { setErrors([e]) });
      if (results) {
        navigate("/")
      }
    }
  }

  return <>
    <Box>
      <ToggleButtonGroup onChange={handleWeekSelect} value={selectedWeek} exclusive>
        {weeks && weeks.map(w => (
          <ToggleButton key={`week-select-${w.number}`} tw="bg-green-600 hover:bg-green-400" value={w}>{w.number}</ToggleButton>
        ))}
      </ToggleButtonGroup>

    </Box>
    <Container maxWidth="md">
      {selectedWeek && campers &&
        <Paper >
          <Typography variant="h4" component="h1">Give an Award</Typography>
          <Stack tw="px-4 py-2" spacing={2}>
            <Autocomplete
              multiple
              options={campers}
              getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName}`}
              value={fields.name}
              onChange={((e, list) => {
                setSelectedField(list);
              })}
              inputValue={textField}
              onInputChange={(e, value) => {
                setTextField(value);
              }}
              renderInput={(params) => <TextField {...params} variant="standard" placeholder="Camper(s)" label="Awarded To" />}
            />
            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
              <TextField label="Awarded For" name="reason" onChange={handleFormChange} variant="outlined" tw="w-full" />
              <FormControl tw="w-full">
                <InputLabel id="awardTypeSelect" > Award Type </InputLabel>
                <Select
                  labelId="awardTypeSelect"
                  label="Award Type"
                  name="programAreaId"
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
      <ErrorsBar />
    </Container>
  </>
}

export default CreateAward
