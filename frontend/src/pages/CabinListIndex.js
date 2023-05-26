import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import { Link, Outlet } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw from 'twin.macro';
import 'styled-components/macro';
import { MenuSelector } from "../components/styled";
import fetchWithToken from "../fetchWithToken";
import { CabinGrid, CamperCol, CamperItem, PronounBadge } from "./CabinList";

const CabinListIndex = () => {
  const [weeks] = useGetDataOnMount({
    url: "/api/weeks",
    useToken: true,
    initialState: [],
  });

  const [selectedWeek, setSelectedWeek] = useState(undefined);

  const [selected, setSelected] = useState({ cabin: "all" });

  const [campersByCabin, setCampersByCabin] = useState({});

  const [displayedCabins, setDisplayedCabins] = useState([]);

  const auth = useContext(UserContext);
  /** Select a week */
  const selectWeek = (week) => {
    setSelectedWeek(week);
  }


  /** Select cabin */
  const selectCabin = (cabinName) => {
    setSelected(s => ({ ...s, cabin: cabinName }));
  }

  useEffect(() => {
    // Handle display of selected cabin
    const cabins = Object.keys(campersByCabin);
    if (cabins === undefined) {
      return;
    }
    if (selected.cabin === "all") {
      const cabinsToDisplay = cabins.reduce((acc, cv) => {
        acc = [
          ...acc,
          { cabinName: cv, campers: campersByCabin[cv] },
        ];
        console.log({ acc })
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
    /** Take list of campers in session, group into object with cabins as keys 
      * @param {campers[]} campers array of camper sessions**/
    console.log("EFFECT")
    if (selectedWeek !== undefined) {
      const groupCampersByCabin = (campers) => {
        const campersByCabin = campers.reduce((acc, cv) => {
          if (acc[cv.cabinName] === undefined) {
            acc[cv.cabinName] = [];
          }
          acc[cv.cabinName].push(cv);
          return acc;
        }, {})
        return campersByCabin;
      };

      /** Fetch camper-weeks from api */
      const getCampersByCabin = async () => {

        const camperResponse = await fetchWithToken(
          `/api/camper-weeks?week=${selectedWeek.number}`,
          {},
          auth
        );
        const campers = await camperResponse.json();
        const sorted = groupCampersByCabin(campers);
        setCampersByCabin(sorted);
        // do it
      };
      setDisplayedCabins(undefined);
      getCampersByCabin();
    }
  }, [selectedWeek, auth]);
  return (
    <>
      <ul tw="flex justify-center sm:justify-evenly gap-2">
        {weeks.map((week) => {
          return (
            <li onClick={() => { selectWeek(week) }} key={`week-${week.number}`}>
              <MenuSelector isSelected={selectedWeek && week.number === selectedWeek.number} >
                <h2><span tw="hidden  sm:block">Week</span> {week.number} </h2><span tw="hidden sm:block text-xs font-thin">{week.title}</span>
              </MenuSelector>
            </li>
          )
        })}
      </ul>
      {selectedWeek && <h1>Week {selectedWeek.number}</h1>}
      {selectedWeek && <h2 tw="font-thin">{selectedWeek.title}</h2>}

      <ul tw="flex justify-center gap-1 flex-wrap">
        <MenuSelector
          tw="px-2"
          onClick={() => selectCabin("all")}
          isSelected={selected.cabin === "all"}
        >
          All
        </MenuSelector>
        {Object.keys(campersByCabin).map(cabinName =>
          <MenuSelector
            tw="px-2"
            onClick={() => selectCabin(cabinName)}
            isSelected={selected.cabin === cabinName}
          >
            <button>{cabinName}</button>
          </MenuSelector>
        )}
      </ul>
      {displayedCabins &&
        <CabinGrid count={displayedCabins.length}>
          {displayedCabins.length > 0 &&
            displayedCabins.map((cabin) => {
              console.log({ displayedCabins, cabin })
              return (
                <li tw="mx-1" key={`cabin-${cabin.cabinName}`}>
                  <header tw="bg-green-200 sticky top-0">
                    <h3 tw="font-bold text-xl">
                      {cabin.cabinName}
                    </h3>
                  </header>
                  <ul tw="flex flex-col gap-1 w-11/12 m-1">
                    {console.log(cabin.campers)}
                    {cabin.campers.map((camper) => (
                      < CamperItem dayCamp={camper.dayCamp} key={`camper-${camper.id}`} fl={camper.fl} >
                        <CamperCol>
                          <span tw="text-sm">{camper.firstName} {camper.lastName} </span>
                        </CamperCol>
                        {camper.dayCamp &&
                          <CamperCol>
                            <span tw="text-sm">{" "}day</span>
                          </CamperCol>}
                        {camper.fl &&
                          <CamperCol>
                            <span tw="text-sm">{" "}fl</span>
                          </CamperCol>
                        }
                        <CamperCol>
                          < span tw="italic font-light" > {camper.age}</span>
                        </CamperCol>
                        <CamperCol>
                          {camper.pronouns && <PronounBadge tw="text-sm">{camper.pronouns.toLowerCase()}</PronounBadge>}
                        </CamperCol>

                      </CamperItem>
                    ))}
                  </ul>
                </li>
              );
            })}
        </CabinGrid>
      }
    </>
  )
}

export default CabinListIndex
