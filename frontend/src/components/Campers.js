import Camper from "./Camper";
import tw, { styled } from "twin.macro";
import { AssignmentHeader } from "./styled";
import { Box, Typography ,Stack} from "@mui/material";

const CamperList = styled.ul(() => [
  tw`flex w-full  py-2 px-4  flex-wrap justify-start gap-1 md:gap-2 `,
]);
const Campers = ({ select, deselect, list, allCampers }) => {
  return (
    <>
      <Stack >
        {list.map((camper, index) => (
          <Camper
            full
            selectable={true}
            key={`camper-${camper.id}`}
            camper={camper}
            index={index}
            select={select}
            deselect={deselect}
          />
        ))}
      </Stack>
    </>
  )
};

export default Campers;
