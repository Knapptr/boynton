import { useState } from "react";
import { Box, Slider, Typography } from "@mui/material"

const TIME = 100;

const Slay = () => {
  const [speed, setSpeed] = useState(2000);
  const [sliderValue, setSliderValue] = useState(1000)
  const handleUp = (e, value) => {
    setSpeed(value)
  }
  const handleChange = (e, value) => {
    setSliderValue(value);
  }
  return (
    <Box height="100vh" bgcolor="black" width={1} display="flex" flexDirectior={{xs:"column",lg:"row"}} justifyContent="center" alignItems="center" >
      <Typography color="pink" >S L A Y</Typography>

      <Box width={8/12} position="fixob" bottom={1}>
        <Slider
          aria-label="Temperature"
          orientation="horizontal"
          valueLabelDisplay="off"
          value={sliderValue}
          onChangeCommitted={handleUp}
          min={400}
          max={4000}
          onChange={handleChange}
          color="pink"
        />
      </Box>
    </Box>
  )
}

export default Slay
