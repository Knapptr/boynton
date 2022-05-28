import { Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";

const CamperWrapper = styled.div(({ grow }) => [grow && tw`flex-grow`]);

const CamperItem = styled.div(({ isDragging }) => [
	tw`m-0.5 p-1 bg-green-200 `,
	isDragging && tw`bg-green-500`,
]);
const Camper = ({ grow, firstName, lastName, age, id, index }) => {
	return (
		<CamperWrapper grow={grow}>
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
		</CamperWrapper>
	);
};

export default Camper;
