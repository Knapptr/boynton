import Camper from "./Camper";
import { useState, useEffect } from "react";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
const CabinComponentFrame = styled.div(({ cabinsOnly }) => [
  tw`w-1/3 flex-grow`,
  cabinsOnly && tw`w-1/2 lg:w-1/5`,
]);
const CabinWrapper = styled.div(({ isOpen, disabled, isOver }) => [
  tw`select-none p-2 flex flex-col bg-sky-600 border border-sky-700  `,
  disabled && tw`bg-red-300`,
  isOver && tw`bg-sky-800 border-sky-900`,
]);
const CamperList = styled.ul(({ isOpen, hasCampers }) => [
  tw`p-1 rounded flex-grow flex flex-col gap-1`,
  hasCampers && isOpen && tw`bg-sky-800`,
]);
const Cabin = ({ assign, session, allOpenState, unassignCamper, cabinsOnly }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => {
    setIsOpen((o) => !o);
  };
  useEffect(() => {
    setIsOpen(allOpenState);
  }, [allOpenState]);

  /** Get min and max ages in cabin, ignoring FLs */
  const getMinMaxAge = () => {
    if (session.campers.every(c => c.fl)) {
      return { min: "FL", max: "ONLY" }
    };
    // Cabins are sorted by age in the response, so iterate through until a non FL is found on each end
    let i = 0;
    let j = session.campers.length - 1;

    while (i < session.campers.length && session.campers[i].fl) { i++ }
    while (j > 0 && session.campers[j].fl) { j-- }
    if (j < 0) {
      return { min: session.campers[0].age, max: session.campers[0].age }
    }
    return { min: session.campers[i].age, max: session.campers[j].age };
  }

  return (
    <CabinComponentFrame cabinsOnly={cabinsOnly}>
      <CabinWrapper
        disabled={session.campers.length === session.capacity}
        onClick={(e) => {
          e.stopPropagation();
          // if (list.length === session.capacity) {
          //   console.log("Cabin is full.");
          // } else {
          assign(session, session.campers.length);
          //}
        }}
      >
        <header tw="flex justify-between">
          <h4 tw="font-bold text-xl">{session.name}</h4>
          <h4 tw="font-bold text-2xl">
            {session.campers.length}/{session.capacity}
          </h4>
        </header>
        <div tw="flex justify-end">
          {session.campers.length > 0 && !allOpenState && (
            <button onClick={(e) => { e.stopPropagation(); toggleOpen() }}>
              {isOpen ? "Hide List" : "View List"}
            </button>
          )}
          <h4 tw="ml-auto">
            {session.campers.length <= 0
              ? "Empty"
              : `Ages: ${getMinMaxAge().min} - ${getMinMaxAge().max}`}
          </h4>
        </div>
        <CamperList isOpen={isOpen} hasCampers={session.campers.length > 0}>
          {isOpen &&
            session.campers.map((camper, index) => {
              return (
                <Camper
                  cabinName={session.name}
                  selectable={false}
                  full
                  removable
                  unassignCamper={unassignCamper}
                  key={`camper-${camper.id}`}
                  camper={camper}
                  index={index}
                />
              );
            })}
        </CamperList>
      </CabinWrapper>
    </CabinComponentFrame>
  );
};

export default Cabin;
