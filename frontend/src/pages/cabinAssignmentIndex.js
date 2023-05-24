import useGetDataOnMount from "../hooks/useGetData";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MenuSelector } from "../components/styled";
import tw, { styled } from 'twin.macro';
import 'styled-components/macro'

const CabinAssignmentIndex = () => {
  const navigate = useNavigate();
  const [weeks, _] = useGetDataOnMount({
    url: "/api/weeks",
    initialState: [],
    useToken: true,
  });
  const [selected, setSelected] = useState({ area: null, week: null });
  const selectArea = (area) => {
    setSelected((s) => ({ ...s, area }));
  };
  const selectWeek = (index) => {
    setSelected((s) => ({ ...s, week: index }));
  };
  useEffect(() => {
    if (selected.week !== null && selected.area !== null) {
      navigate(`/cabins/assignment/${selected.area}/${weeks[selected.week].number}`)
    }
  }, [weeks, navigate, selected.week, selected.area])

  return (
    <>
      <div tw="mx-auto w-1/2">
        <header><h1>Select Week</h1></header>
        <ul tw="my-6 flex flex-col justify-center gap-2 ">
          {weeks.map((week, index) => (
            <MenuSelector onClick={() => selectWeek(index)} isSelected={index === selected.week} key={`week-${index}`}>
              <button >
                Week {week.number}
              </button>
            </MenuSelector>
          ))}
        </ul>
        <header><h1>Select Area</h1></header>
        <ul tw="my-6 flex gap-2 justify-center">
          <MenuSelector onClick={() => selectArea("GA")} isSelected={selected.area === "GA"}>
            <button >GA</button>
          </MenuSelector>
          <MenuSelector onClick={() => selectArea("BA")} isSelected={selected.area === "BA"}>
            <button >BA</button>
          </MenuSelector>
        </ul>
      </div>
    </>
  );
};

export default CabinAssignmentIndex;
