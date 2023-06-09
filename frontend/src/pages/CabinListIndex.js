import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import { Link, Outlet } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw from 'twin.macro';
import 'styled-components/macro';
import { MenuSelector } from "../components/styled";
import fetchWithToken from "../fetchWithToken";
import { CabinGrid, CamperCol, CamperItem, PronounBadge } from "./CabinList";
import sortCabins from "../sortCabins";

/** A helper to deal with the cabin list */
const cabinSelections = {
  all: (cabinSessions) => ({ selectionName: "ALL", cabins: cabinSessions }),
  ba: (cabinSessions) => ({ selectionName: "BA", cabins: cabinSessions.filter(c => c.area === "BA").sort(sortCabins) }),
  ga: (cabinSessions) => ({ selectionName: "GA", cabins: cabinSessions.filter(c => c.area === "GA").sort(sortCabins) }),
  single: (cabin) => ({ selectionName: cabin.name, cabins: [cabin] }),
  none: () => ({ selectionName: "NONE", cabins: [] })
}

const CabinListIndex = () => {
  const [weeks] = useGetDataOnMount({
    url: "/api/weeks",
    useToken: true,
    initialState: [],
  });

  const [selectedWeek, setSelectedWeek] = useState(null);

  const [cabinSessions, setCabinSessions] = useState([]);


  const [selected, setSelected] = useState(cabinSelections.none());

  const [unassignedCampers, setUnassignedCampers] = useState([]);

  const auth = useContext(UserContext);
  /** Select a week */
  const selectWeek = (week) => {
    setCabinSessions([]);
    setSelected(cabinSelections.none());
    setSelectedWeek(week);
  }

  /** Select cabin */
  const selectCabin = (selection) => {
    setSelected(s => (selection));
  }

  /**Get amount of current cabins */
  const getCabinDisplayCount = () => {
    // This weird conditional handles the "Has no campers assigned" text. It's a quick fix.
    if ((selected.selectionName === "GA" || selected.selectionName === "BA") && selected.cabins.every(c => c.campers.length === 0)) {
      return 1
    }
    return selected.cabins.length;
  }
  /** Handle the selection of a week  */
  useEffect(() => {
    if (selectedWeek !== null) {
      /** Fetch cabin-sessions from api Defined here because of useEffect dependencies */
      const getCabinSessions = async () => {

        const csResponse = await fetchWithToken(
          `/api/cabin-sessions?week=${selectedWeek.number}`,
          {},
          auth
        );
        const cabinSessionsResponse = await csResponse.json();
        // group by area
        cabinSessionsResponse.sort((a, _) => a === "GA" ? 1 : -1);
        setSelected(cabinSelections.all(cabinSessionsResponse));
        setCabinSessions(cabinSessionsResponse);
      };

      /** Fetch unassigned Campers. Defined here because of useEffect dependencies */
      const getUnassignedCampers = async () => {
        // unpopulatel list to avoid display conflicts
        setUnassignedCampers([]);
        const ucResponse = await fetchWithToken(`/api/camper-weeks?week=${selectedWeek.number}&cabin=unassigned`, {}, auth)
        const unassigned = await ucResponse.json();
        setUnassignedCampers(unassigned);
      }
      getCabinSessions();
      getUnassignedCampers();
    }
  }, [selectedWeek, auth]);

  return (
    <>
      <ul tw="flex justify-center sm:justify-evenly gap-2 print:hidden">
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

      <ul tw="flex justify-center gap-1 flex-wrap mb-4 print:hidden">
        {cabinSessions.length > 0 &&
          <><MenuSelector
            tw="px-2"
            onClick={() => selectCabin(cabinSelections.all(cabinSessions))}
            isSelected={selected.selectionName === "ALL"}
          >
            All
          </MenuSelector>
            <MenuSelector
              tw="px-2"
              onClick={() => selectCabin(cabinSelections.ba(cabinSessions))}
              isSelected={selected.selectionName === "BA"}
            >
              BA
            </MenuSelector>
            <MenuSelector
              tw="px-2"
              onClick={() => selectCabin(cabinSelections.ga(cabinSessions))}
              isSelected={selected.selectionName === "GA"}
            >
              GA
            </MenuSelector>


            {cabinSessions.map(cabin =>
              <MenuSelector
                tw="px-2"
                onClick={() => selectCabin(cabinSelections.single(cabin))}
                isSelected={selected.selectionName === cabin.name}
                key={`selector-cabin-${cabin.name}`}
              >
                <button>{cabin.name}</button>
              </MenuSelector>
            )} </>
        }
      </ul>
      <CabinGrid count={getCabinDisplayCount()}>
        {selected.selectionName !== "ALL"
          && selected.selectionName !== "NONE"
          && selected.cabins.every(c => c.campers.length === 0)
          && <span> {selected.selectionName} has no assigned Campers. Either cabins have not been assigned, or it is empty this week.</span>}
        {
          selected.cabins.filter(c => c.campers.length > 0).map((cabin) => {
            return (
              <li tw="mx-1" key={`cabin-${cabin.name}`}>
                <header tw="bg-green-200 sticky top-0">
                  <h3 tw="font-bold text-xl">
                    {cabin.name}
                  </h3>
                </header>
                <ul tw="flex flex-col gap-1 w-11/12 m-1">
                  {cabin.campers.map((camper) => (
                    < CamperItem dayCamp={camper.dayCamp} key={`camper-${camper.sessionId}`} fl={camper.fl} >
                      <CamperCol>
                        <span tw="text-sm">{camper.firstName} {camper.lastName} </span>
                        <span > {camper.age}</span>
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
                        {camper.pronouns && <PronounBadge tw="text-sm">{camper.pronouns.toLowerCase()}</PronounBadge>}
                      </CamperCol>

                    </CamperItem>
                  ))}
                </ul>
              </li>
            );
          })}
        {/* UNASSIGNED CAMPERS */}
        {selected.selectionName === "ALL" && unassignedCampers.length > 0 &&

          <li tw="mx-1" key={`cabin-unassigned`}>
            <header tw="bg-green-200 sticky top-0">
              <h3 tw="font-bold text-xl">
                Unassigned
              </h3>
            </header>
            <ul tw="flex flex-col gap-1 w-11/12 m-1">
              {unassignedCampers.map((camper) => (
                < CamperItem dayCamp={camper.dayCamp} key={`camper-${camper.sessionId}`} fl={camper.fl} >
                  <CamperCol>
                    <span tw="text-sm">{camper.firstName} {camper.lastName} </span>
                    <span > {camper.age}</span>
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
                    {camper.pronouns && <PronounBadge tw="text-sm">{camper.pronouns.toLowerCase()}</PronounBadge>}
                  </CamperCol>

                </CamperItem>
              ))}
            </ul>
          </li>
        }
      </CabinGrid>
    </>
  )
}

export default CabinListIndex
            // {unassignedCampers.map(camper => (
            //   < CamperItem dayCamp={camper.dayCamp} key={`camper-${camper.sessionId}`} fl={camper.fl} >
            //     <CamperCol>
            //       <span tw="text-sm">{camper.firstName} {camper.lastName} </span>
            //       <span > {camper.age}</span>
            //     </CamperCol>
            //     {camper.dayCamp &&
            //       <CamperCol>
            //         <span tw="text-sm">{" "}day</span>
            //       </CamperCol>}
            //     {camper.fl &&
            //       <CamperCol>
            //         <span tw="text-sm">{" "}fl</span>
            //       </CamperCol>
            //     }
            //     <CamperCol>
            //       {camper.pronouns && <PronounBadge tw="text-sm">{camper.pronouns.toLowerCase()}</PronounBadge>}
            //     </CamperCol>

            //   </CamperItem>
            // ))}
