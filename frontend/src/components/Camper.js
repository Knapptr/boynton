import { Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const RemoveButton = tw.button`rounded bg-red-500 text-white p-1 m-0.5 hover:bg-red-700 mr-3`;
const CamperItem = styled.li(({ full, isDragging, removable, isSelected }) => [
  tw`p-1 bg-green-200 flex items-center`,
  !removable && tw`pl-4`,
  // isDragging && tw`bg-green-500`,
  full && tw`w-full`,
  isSelected && tw`bg-green-500`
]);

const Camper = ({
  camper,
  full,
  index,
  cabinName,
  unassignCamper,
  removable,
  select,
  deselect
}) => {
  const { firstName, lastName, age, id, dayCamp, camperID } = camper;
  const [isSelected, setIsSelected] = useState(false);
  return (
    <CamperItem
      onClick={() => {
        if (isSelected) {
          deselect(id);
          setIsSelected(false);
        } else {
          select(camperID, id);
          setIsSelected(true);
        }
      }}
      full={full}
      removable={removable}
      select={select}
      isSelected={isSelected}
    >
      {removable && (
        <RemoveButton
          onClick={() => {
            unassignCamper(camper, index, cabinName);
          }}
        >
          <FontAwesomeIcon icon={faUserMinus} />
        </RemoveButton>
      )}
      <p tw="text-lg">
        <span tw="font-light"> {age}</span> {firstName} {lastName}
        {dayCamp && <span tw="italic"> DAY</span>}
      </p>
    </CamperItem>
  );
};

export default Camper;
