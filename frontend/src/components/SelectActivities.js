import useActivityAttendance from "../hooks/useActivityAttendance";
import { DragDropContext, Droppable, Draggable } from "@react-forked/dnd";
import tw from "twin.macro";
import "styled-components/macro";

const SelectActivities = ({ periodID, cabinName }) => {
	const { activityLists } = useActivityAttendance(periodID, cabinName);
	return (
		<DragDropContext
			onDragEnd={(drop) => {
				console.log(drop);
			}}
		>
			<h1>Select Activities {periodID}</h1>
			<div tw="flex justify-center m-2 items-start">
				<Droppable droppableId="campers">
					{(provided) => (
						<ul
							ref={provided.innerRef}
							{...provided.droppableProps}
						>
							<header>
								<h2>Campers</h2>
								{activityLists.unassigned &&
									activityLists.unassigned.campers.map(
										(c, index) => (
											<Draggable
												index={index}
												draggableId={`${c.id}`}
											>
												{(provided) => (
													<li
														{...provided.dragHandleProps}
														{...provided.draggableProps}
														ref={provided.innerRef}
													>
														{c.firstName}{" "}
														{c.lastName}
													</li>
												)}
											</Draggable>
										)
									)}
							</header>
						</ul>
					)}
				</Droppable>
				<div tw="flex flex-col">
					{activityLists.activityIds &&
						activityLists.activityIds.map((aid) => (
							<Droppable droppableId={`${aid}`}>
								{(provided) => (
									<ul
										tw="p-4 bg-green-300 m-3"
										ref={provided.innerRef}
										{...provided.droppableProps}
									>
										<header>
											{activityLists[aid].name}
										</header>
										{activityLists[aid].campers.map(
											(c, index) => (
												<Draggable
													draggableId={`${c.id}`}
													index={index}
												>
													{(provided) => (
														<li
															{...provided.dragHandleProps}
															{...provided.draggableProps}
															ref={
																provided.innerRef
															}
														>
															{c.firstName}{" "}
															{c.lastName}
														</li>
													)}
												</Draggable>
											)
										)}
									</ul>
								)}
							</Droppable>
						))}
				</div>
			</div>
		</DragDropContext>
	);
};

export default SelectActivities;
