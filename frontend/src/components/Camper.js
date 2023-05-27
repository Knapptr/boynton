import { Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const RemoveButton = tw.button`rounded bg-red-500 text-white p-1 m-0.5 hover:bg-red-700 mr-3`;
const CamperItem = styled.li(({ full, removable, isSelected, dayCamp, fl }) => [
    tw`p-1 bg-green-200 flex items-center`,
    dayCamp && tw`bg-yellow-200`,
    fl && tw`bg-orange-200`,
    !removable && tw`pl-4`,
    full && tw`w-full`,
    isSelected && tw`bg-green-500`,
]);

const Camper = ({
    camper,
    full,
    index,
    cabinName,
    unassignCamper,
    removable,
    select,
    selectable,
    deselect
}) => {
    const { firstName, lastName, age, id, dayCamp, camperID, fl } = camper;
    const [isSelected, setIsSelected] = useState(false);
    return (
        <CamperItem
            onClick={(e) => {
                e.stopPropagation();
                if (selectable) {
                    if (isSelected) {
                        deselect(id);
                        setIsSelected(false);
                    } else {
                        select(camper);
                        setIsSelected(true);
                    }
                }
            }}
            full={full}
            removable={removable}
            select={select}
            isSelected={isSelected}
            dayCamp={dayCamp}
            fl={fl}
        >
            {removable && (
                <RemoveButton
                    onClick={(e) => {
                        e.stopPropagation();
                        unassignCamper(index);
                    }}
                >
                    <FontAwesomeIcon icon={faUserMinus} />
                </RemoveButton>
            )}
            <p tw="text-lg">
                <span tw="font-light"> {age}</span>  {firstName} {lastName}
                {dayCamp && <span tw="font-light text-xs">{" "}day</span>}
                {fl && <span tw="font-light text-xs">{" "}FL</span>}
            </p>
        </CamperItem>
    );
};

export default Camper;
