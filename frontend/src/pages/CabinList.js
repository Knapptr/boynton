import { MenuSelector } from "../components/styled";
import useGetDataOnMount from "../hooks/useGetData";
import ts, { styled } from "twin.macro";
import "styled-components/macro";
import { useCallback, useContext, useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from "../components/UserContext";

const CabinListPage = () => {
  const auth = useContext(UserContext);
  const [selected, setSelected] = useState({ week: null, cabin: "all" });
  const [campersByCabin, setCampersByCabin] = useState({});
  const [displayedCabins, setDisplayedCabins] = useState([]);

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

  const [weeks] = useGetDataOnMount({
    url: "/api/weeks",
    useToken: true,
    initialState: [],
  });
  const selectWeek = (selectedIndex) => {
    setSelected((s) => ({ ...s, week: selectedIndex }));
  };
  const selectCabin = (cabinName) => {
    setSelected((s) => ({ ...s, cabin: cabinName }));
  };
  const selectedWeek = useCallback(() => {
    return weeks[selected.week].number;
  }, [selected, weeks]);

  useEffect(() => {
    if (selected.week === null) {
      return;
    }
    const groupCampersByCabin = (campers) => {
      const data = campers.reduce(
        (acc, cv) => {
          const camperSession = cv.weeks.find(
            (w) => w.number === selectedWeek()
          );
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
        if (typeof a === Number) {
          if (typeof b === Number) {
            return a - b;
          }
          return 1;
        }
        if (typeof b === Number) {
          return 1;
        }
        if (a === null) {
          return 1;
        }
        if (b === null) {
          return -1;
        }
        if (a < b) {
          return -1;
        }
        return 1;
      });
      return data;
    };
    const getCampersByCabin = async () => {
      const camperResponse = await fetchWithToken(
        `/api/campers?week=${selectedWeek()}`,
        {},
        auth
      );
      const campers = await camperResponse.json();
      setCampersByCabin(groupCampersByCabin(campers));
    };
    getCampersByCabin();
  }, [selected, selectedWeek, auth]);
  return (
    <>
      <h1>Week</h1>
      <ul tw="flex justify-center gap-3">
        {weeks.map((week, weekIndex) => (
          <MenuSelector
            tw="px-4"
            onClick={() => selectWeek(weekIndex)}
            isSelected={selected.week === weekIndex}
          >
            <button>{week.number}</button>
          </MenuSelector>
        ))}
      </ul>
      <ul tw="flex justify-center gap-3 flex-wrap">
        {campersByCabin.cabins &&
            campersByCabin.cabins.filter(cabinName=>cabinName !== null).map((cabinName, cabinIndex) => (
            <MenuSelector
              tw="px-4"
              onClick={() => selectCabin(cabinName)}
              isSelected={selected.cabin === cabinName}
            >
              <button>{cabinName}</button>
            </MenuSelector>
          ))}
        <MenuSelector
          tw="px-4"
          onClick={() => selectCabin("all")}
          isSelected={selected.cabin === "all"}
        >
          All
        </MenuSelector>
      </ul>
      <ul>
        {displayedCabins.length > 0 &&
          displayedCabins.map((cabin) => {
            console.log( {displayedCabins,cabin} )
            return (
              <li>
                {cabin.cabinName}
                <ul>
                  {cabin.campers.map((camper) => (
                    <li>
                      {camper.firstName} {camper.lastName}
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
