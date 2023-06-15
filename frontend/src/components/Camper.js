import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Box, IconButton, Stack } from "@mui/material";


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
        <Box
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
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        unassignCamper(camper.id);
                    }}
                >
                    <FontAwesomeIcon icon={faUserMinus} />
                </IconButton>
            )}
            <Stack >
                <span > {age}</span>  {firstName} {lastName}
                {dayCamp && <span >{" "}day</span>}
                {fl && <span >{" "}FL</span>}
            </Stack>
        </Box>
    );
};

export default Camper;
