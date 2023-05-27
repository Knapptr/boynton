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
  assign,
  cabinSessions,
  toggleUnassignModal,
  cabinsOnly,
  lists,
  unassignCamper,
}) => {

  const [hideFull, setHideFull] = useState(false);

  const areEmpty = () => {
    console.log({ cabinSessions });
    if (cabinSessions.every(cabin => cabin.campers.length === 0) || cabinSessions.length === 0) {
      return true;
    }
  };
  const displayCabins = () => {
    let list = cabinSessions;
    if (hideFull) {
      list = cabinSessions.filter(
        (cabin) => cabin.capacity > cabin.campers.length
      );
    }
    return list.map((cabinSession, index) => {
      return (
        <Cabin
          cabinsOnly={cabinsOnly}
          assign={assign}
          key={`cabin-${cabinSession.name}`}
          unassignCamper={(camperIndex) => unassignCamper(index, camperIndex)}
          allOpenState={showAllLists}
          session={cabinSession}
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
