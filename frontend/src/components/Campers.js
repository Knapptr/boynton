import Camper from "./Camper";
import { Droppable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";
import { AssignmentHeader } from "./styled";

const CamperList = styled.div(() => [
    tw`flex w-full  py-2  flex-wrap gap-1 md:gap-2 `,
]);
const Campers = ({ list, allCampers }) => {
	return (
		<Droppable droppableId={"unassigned"}>
			{(provided) => (
				<>
					<AssignmentHeader tw="sticky">
						<h1>{list.length} Unassigned Campers</h1>
						<h1>{allCampers.length} Total Campers</h1>
					</AssignmentHeader>
					<CamperList
						{...provided.droppableProps}
						ref={provided.innerRef}
					>
						{list.map((camper, index) => (
							<Camper
								key={`camper-${camper.id}`}
								{...camper}
								index={index}
							/>
						))}
						{provided.placeholder}
					</CamperList>
				</>
			)}
		</Droppable>
	);
};

export default Campers;
