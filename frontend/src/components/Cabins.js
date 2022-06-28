import { useEffect, useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import Cabin from "./Cabin";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { AssignmentHeader } from "./styled";
import { PropagateLoader } from "react-spinners";

const CabinsList = styled.div(() => [
  tw`w-full bg-sky-300 py-4 flex flex-wrap gap-1`,
]);

const Button = styled.button(() => [tw`bg-green-600 rounded text-white p-2`]);
const UnassignButton = styled.button(({ anyAssignments }) => [
  tw`bg-coolGray-300 py-2 px-3 rounded`,
  anyAssignments && tw`bg-red-500`,
]);
const Cabins = ({
  showAllLists,
  unassignAll,
  cabinSessions,
  toggleUnassignModal,
  cabinsOnly,
  lists,
  unassignCamper,
}) => {
  const [hideFull, setHideFull] = useState(false);
  const areEmpty = () => {
    if (Object.keys(lists).length === 0 || cabinSessions.length === 0) {
      return true;
    }
    return cabinSessions.every((cabin) =>
      lists[cabin.cabinName].every((list) => list.length === 0)
    );
  };
  const displayCabins = () => {
    let list = cabinSessions;
    if (hideFull) {
      list = cabinSessions.filter(
        (cabin) => cabin.capacity > lists[cabin.cabinName].length
      );
    }
    return list.map((cabinSession) => {
      return (
        <Cabin
          cabinsOnly={cabinsOnly}
          key={`cabin-${cabinSession.cabinName}`}
          unassignCamper={unassignCamper}
          allOpenState={showAllLists}
          session={cabinSession}
          list={lists[cabinSession.cabinName].sort(
            (camper1, camper2) => camper1.age > camper2.age
          )}
        />
      );
    });
  };
  return (
    <>
      <AssignmentHeader tw="w-full">
        <h2 tw="font-bold text-lg">Cabins</h2>
        <div>
          <UnassignButton
            tw="mr-5"
            anyAssignments={!areEmpty()}
            onClick={() => {
              if (!areEmpty()) {
                toggleUnassignModal();
              }
            }}
          >
            Unassign All
          </UnassignButton>
          <label htmlFor="hideFullToggle">Hide Full</label>
          <input
            tw="m-1"
            id="hideFullToggle"
            type="checkbox"
            value={hideFull}
            onChange={() => {
              setHideFull((f) => !f);
            }}
          />
        </div>
      </AssignmentHeader>
      <CabinsList>
        {cabinSessions.length === 0 &&
        <div tw="my-2 py-8 text-center w-full ">
          <PropagateLoader loading={true} />
        </div>
        }
        {displayCabins()}
      </CabinsList>
    </>
  );
};

export default Cabins;
