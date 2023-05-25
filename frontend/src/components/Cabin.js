import { Droppable } from "@react-forked/dnd";
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
const Cabin = ({ assign, session, list, allOpenState, unassignCamper, cabinsOnly }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => {
    setIsOpen((o) => !o);
  };
  useEffect(() => {
    setIsOpen(allOpenState);
  }, [allOpenState]);

  return (
    <CabinComponentFrame cabinsOnly={cabinsOnly}>
      <CabinWrapper
        disabled={list.length === session.capacity}
        onClick={(e) => {
          e.stopPropagation();
          // if (list.length === session.capacity) {
          //   console.log("Cabin is full.");
          // } else {
          assign(session, list.length);
          //}
        }}
      >
        <header tw="flex justify-between">
          <h4 tw="font-bold text-xl">{session.cabinName}</h4>
          <h4 tw="font-bold text-2xl">
            {list.length}/{session.capacity}
          </h4>
        </header>
        <div tw="flex justify-end">
          {list.length > 0 && !allOpenState && (
            <button onClick={(e) => { e.stopPropagation(); toggleOpen() }}>
              {isOpen ? "Hide List" : "View List"}
            </button>
          )}
          <h4 tw="ml-auto">
            {list.length <= 0
              ? "Empty"
              : `Ages: ${list[0].age} - ${list[list.length - 1].age}`}
          </h4>
        </div>
        <CamperList isOpen={isOpen} hasCampers={list.length > 0}>
          {isOpen &&
            list.map((camper, index) => {
              return (
                <Camper
                  cabinName={session.cabinName}
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
