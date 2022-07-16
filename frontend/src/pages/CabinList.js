import { MenuSelector } from "../components/styled";
import useGetDataOnMount from "../hooks/useGetData";
import ts, { styled } from "twin.macro";
import "styled-components/macro";
import { useCallback, useContext, useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from "../components/UserContext";
import {useParams} from "react-router-dom";

const CabinListPage = () => {
  const {weekNumber:weekNumberString} = useParams();
  const weekNumber = Number.parseInt(weekNumberString);
  const auth = useContext(UserContext);
  const [selected, setSelected] = useState({ cabin: "all" });
  const [campersByCabin, setCampersByCabin] = useState({});
  const [displayedCabins, setDisplayedCabins] = useState([]);

  const selectCabin = (cabinName)=>{
    setSelected(s=>({...s,cabin:cabinName}));
  }

  useEffect(() => {
    const cabins = campersByCabin.cabins;
    if (cabins === undefined) {
      return;
    }
    if (selected.cabin === "all") {
      const cabinsToDisplay = cabins.reduce((acc, cv) => {
        console.log({cv})
        if (cv === null) {
          return acc;
        }
        acc = [
          ...acc,
          { cabinName: cv, campers: campersByCabin[cv] },
        ];
        return acc;
      }, []);
      setDisplayedCabins(cabinsToDisplay);
      return
    }
    setDisplayedCabins([
      { cabinName: selected.cabin, campers: campersByCabin[selected.cabin] },
    ]);
  }, [selected, campersByCabin]);


  useEffect(() => {
    const groupCampersByCabin = (campers) => {
      const data = campers.reduce(
        (acc, cv) => {
          const camperSession = cv.weeks.find(
            (w) => w.number === weekNumber
          );
          console.log({camperSession,cv})
          if (!acc.cabins.includes(camperSession.cabinName)) {
            acc.cabins.push(camperSession.cabinName);
          }
          acc[camperSession.cabinName] = acc[camperSession.cabinName] || [];
          acc[camperSession.cabinName] = [...acc[camperSession.cabinName], cv];
          return acc;
        },
        { cabins: [] }
      );
      data.cabins.sort((a, b) => {
        const numberA = Number.parseInt(a)
        const numberB = Number.parseInt(b)
        if (numberA) {
          if (numberB) {
            return a - b;
          }
          return -1;
        }
        if (numberB) {
          return 1;}
        return 0
      
       // if (a === null) {
        //   return 1;
        // }
        // if (b === null) {
        //   return -1;
        // }
        // if (a < b) {
        //   return -1;
        // }
        // return 1;
      });
      return data;
    };
    const getCampersByCabin = async () => {
      const camperResponse = await fetchWithToken(
        `/api/campers?week=${weekNumber}`,
        {},
        auth
      );
      const campers = await camperResponse.json();
      setCampersByCabin(groupCampersByCabin(campers));
    };
    getCampersByCabin();
  }, [weekNumber,auth]);
  return (
    <>
      <ul tw="flex justify-center gap-1 flex-wrap">
        <MenuSelector
          tw="px-2"
          onClick={() => selectCabin("all")}
          isSelected={selected.cabin === "all"}
        >
          All
        </MenuSelector>
        {campersByCabin.cabins &&
            campersByCabin.cabins.filter(cabinName=>cabinName !== null).map((cabinName, cabinIndex) => (
            <MenuSelector
              tw="px-2"
              onClick={() => selectCabin(cabinName)}
              isSelected={selected.cabin === cabinName}
            >
              <button>{cabinName}</button>
            </MenuSelector>
          ))}
      </ul>
      <header tw="my-2"><h2 tw="text-xl font-bold ">Week {weekNumber}</h2></header>
      <ul tw="flex flex-col gap-2">
        {displayedCabins.length > 0 &&
          displayedCabins.map((cabin) => {
            console.log( {displayedCabins,cabin} )
            return (
              <li>
                <header tw="bg-green-200 sticky top-0">
                  <h3 tw="font-bold text-xl">
                  {cabin.cabinName}
                  </h3>
                </header>
                <ul tw="flex flex-col gap-1 w-11/12 mx-auto">
                  {cabin.campers.map((camper) => (
                    <li tw="bg-slate-100 text-lg shadow">
                      {camper.firstName} {camper.lastName} <span tw="italic font-light">{camper.age}</span> {camper.weeks.find(w=>w.number === weekNumber && w.dayCamp===true) && <span>DAY</span>}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default CabinListPage;
