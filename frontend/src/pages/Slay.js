import { useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import { Slider } from "@mui/material"

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
    <div tw="h-screen bg-black w-full flex flex-col lg:flex-row items-center justify-center select-none">
      <h1 tw="text-8xl md:text-9xl xl:text-[16rem] text-pink-600 font-bold" css={{ animation: `spinny infinite ${speed}ms linear` }}>S L A Y</h1>

      <div tw=" w-8/12 fixed bottom-1">
        <Slider
          aria-label="Temperature"
          orientation="horizontal"
          valueLabelDisplay="off"
          value={sliderValue}
          onChangeCommitted={handleUp}
          min={400}
          max={4000}
          onChange={handleChange}
          tw="text-pink-600"
        />
      </div>
    </div>
  )
}

export default Slay
