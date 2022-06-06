import { Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";

const CamperItem = styled.div(({full, isDragging }) => [
    tw`p-1 bg-green-200 w-1/3 md:w-1/6 flex-grow max-w-[50%] md:max-w-[18%]`,
	isDragging && tw`bg-green-500`,
    full && tw`max-w-full`
]);

const Camper = ({full, firstName, lastName, age, id, index }) => {
	return (
        <Draggable key={id} draggableId={`${id}`} index={index}>
			{(provided, snapshot) => {
				return (
					<CamperItem
                        full={full}
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
