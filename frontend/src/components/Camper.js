import { Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";

const RemoveButton = tw.button`rounded bg-red-500 text-white p-1 m-0.5 hover:bg-red-700 mr-3`;
const CamperItem = styled.li(({ full, isDragging, removable }) => [
  tw`p-1 bg-green-200 flex items-center`,
  !removable && tw`pl-4`,
  isDragging && tw`bg-green-500`,
  full && tw`w-full`,
]);

const Camper = ({
  camper,
  full,
  index,
  cabinName,
  unassignCamper,
  removable,
}) => {
  const { firstName, lastName, age, id,dayCamp } = camper;
  return (
    <Draggable key={id} draggableId={`${id}`} index={index}>
      {(provided, snapshot) => {
        return (
          <CamperItem
            full={full}
            removable={removable}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
          >
            {removable && !snapshot.isDragging && (
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
      }}
    </Draggable>
  );
};

export default Camper;
