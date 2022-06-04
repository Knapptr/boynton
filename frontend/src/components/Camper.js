import { Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";

const CamperItem = styled.div(({ isDragging }) => [
	tw`p-1 bg-green-200 w-1/3 md:w-1/6 flex-grow `,
	isDragging && tw`bg-green-500`,
]);
const Camper = ({ grow, firstName, lastName, age, id, index }) => {
	return (
		<Draggable key={id} draggableId={`${id}`} index={index}>
			{(provided, snapshot) => {
				return (
					<CamperItem
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						ref={provided.innerRef}
						isDragging={snapshot.isDragging}
					>
						<p>
							{firstName} {lastName} {age}
						</p>
					</CamperItem>
				);
			}}
		</Draggable>
	);
};

export default Camper;
