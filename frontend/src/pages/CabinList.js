import { MenuSelector } from "../components/styled";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { useCallback, useContext, useEffect, useState } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from "../components/UserContext";
import { useParams } from "react-router-dom";

export const CamperItem = styled.li(({ dayCamp, fl }) => [
    tw`bg-green-100 flex justify-start `,
    dayCamp && tw`bg-yellow-200`,
    fl && tw`bg-orange-200`
]);

export const PronounBadge = styled.span(() => [
    tw`rounded bg-red-100 px-2 mx-1`
])


export const CamperCol = styled.div(() => [
    tw`mx-1`
]);

export const CabinGrid = styled.ul(({ count }) => [
    tw`grid`,
    tw`grid-cols-1 sm:grid-cols-3 md:grid-cols-4`,
    count < 4 && tw`sm:grid-cols-1 md:grid-cols-2 `,
    count == 1 && tw`sm:grid-cols-1 md:grid-cols-1`

])

const CabinListPage = () => {
    const { weekNumber: weekNumberString } = useParams();
    const weekNumber = Number.parseInt(weekNumberString);
    const auth = useContext(UserContext);
    const [selected, setSelected] = useState({ cabin: "all" });
    const [campersByCabin, setCampersByCabin] = useState({});
    const [displayedCabins, setDisplayedCabins] = useState([]);

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
                `/api/camper-weeks?week=${weekNumber}`,
                {},
                auth
            );
            const campers = await camperResponse.json();
            const sorted = groupCampersByCabin(campers);
            setCampersByCabin(sorted);
        };
        // do it
        getCampersByCabin();
    }, [weekNumber, auth]);

    return (
        <>
            <ul tw="flex justify-center gap-1 flex-wrap print:hidden">
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
            <header tw="my-2"><h2 tw="text-xl font-bold ">Week {weekNumber}</h2></header>
            <CabinGrid count={displayedCabins.length}>
                {displayedCabins.length > 0 &&
                    displayedCabins.map((cabin) => {
                        console.log({ displayedCabins, cabin })
                        return (
                            <li tw="mx-1" key={`cabin-${cabin.cabinName}`}>
                                <header tw="bg-green-200 sticky">
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
        </>
    );
};

export default CabinListPage;
