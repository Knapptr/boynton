import Camper from "./Camper";
import { Droppable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";
import { StickyHeader } from "./styled";

const CamperList = styled.div(() => [
	tw`flex flex-wrap md:flex-col  w-full  justify-center `,
]);
const Campers = ({ list, allCampers }) => {
	return (
		<Droppable droppableId={"campers_DROP"}>
			{(provided) => (
				<>
					<StickyHeader>
						<h1>{list.length} Unassigned Campers</h1>
						<h1>{allCampers.length} Total Campers</h1>
					</StickyHeader>
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
