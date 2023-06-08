import tw from "twin.macro";
import "styled-components/macro";

import { Button, Container, Autocomplete, Paper, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import { useState } from "react";
import { Box, Stack } from "@mui/system";

const CAMPER_OPTIONS = [{ id: 1, label: "Tyler" }, { id: 2, label: "Anja" }, { id: 3, label: "Sokhna" }]
const PROGRAM_AREAS = ["Challenge Activities", "Archery", "Ropes", "Waterfront", "Polar Bear Dip", "Creative Arts", "Superstar"]

const CreateAward = () => {

  const [options, setOptions] = useState({})
  const [textField, setTextField] = useState("");
  const [selectedField, setSelectedField] = useState(null);

  const handleChange = (event) => {
    setOptions(o => ({ ...o, [event.target.name]: event.target.value }))
  }



  return <>
    <Container maxWidth="md">
      <Paper >
        <Typography variant="h4" component="h1">Give an Award</Typography>
        <Stack tw="px-4 py-2" spacing={2}>
          <Autocomplete
            multiple
            options={CAMPER_OPTIONS}
            value={options.name}
            onChange={((e, value) => {
              if (value && value.id) {
                setSelectedField(value.id);
              }
            })}
            inputValue={textField}
            onInputChange={(e, value) => {
              setTextField(value);
            }}
            renderInput={(params) => <TextField {...params} variant="standard" placeholder="Camper(s)" label="Awarded To" />}
          />
          <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
            <TextField label="Awarded For" name="awardFor" onChange={handleChange} variant="outlined" tw="w-full" />
            <FormControl tw="w-full">
              <InputLabel id="awardTypeSelect" > Award Type </InputLabel>
              <Select
                labelId="awardTypeSelect"
                label="Award Type"
                name="awardType"
                id="awardTSelect"
                onChange={handleChange}
                value={options.awardType}
                tw="w-full text-left"
              >
                {PROGRAM_AREAS.map(a => {
                  return <MenuItem value={a}>{a}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
        <Box>
          {/* WTF */}
          <Button variant="contained" >Award!</Button>
        </Box>
      </Paper>
    </Container>
  </>
}

export default CreateAward
