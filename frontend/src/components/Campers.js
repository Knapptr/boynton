import Camper from "./Camper";
import tw, { styled } from "twin.macro";
import { AssignmentHeader } from "./styled";

const CamperList = styled.ul(() => [
  tw`flex w-full  py-2 px-4  flex-wrap justify-start gap-1 md:gap-2 `,
]);
const Campers = ({ select, deselect, list, allCampers }) => {
  return (
    <>
      <AssignmentHeader tw="sticky">
        <h1>{list.length} Unassigned Campers</h1>
        <h1>{allCampers.length} Total Campers</h1>
      </AssignmentHeader>

      <CamperList >
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
      </CamperList>
    </>
  )
};

export default Campers;
