import useActivityAttendance from "../hooks/useActivityAttendance";
import { DragDropContext, Droppable, Draggable } from "@react-forked/dnd";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const CamperItem = styled.li(({ isDragging }) => [
	isDragging && tw`bg-green-400`,
]);
const ActivityList = styled.ul(({ blue, isDraggingOver }) => [
	tw`p-3 bg-purple-200 my-3 justify-center flex flex-col items-center`,
	blue && tw`bg-blue-200`,
	isDraggingOver && tw`bg-purple-600`,
	isDraggingOver && blue && tw`bg-blue-500`,
]);
const SelectActivities = ({ periodID, cabinName }) => {
	const { activityLists, updateActivityAttendance } = useActivityAttendance(
		periodID,
		cabinName
	);
	const addCamperActivityToDB = async (
		camperWeekId,
		activityId,
		periodId
	) => {
		const camper = {
			camperWeekId,
			periodId,
		};
		const reqConfig = {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(camper),
		};
		const result = await fetch(
			`/api/activities/${activityId}/campers`,
			reqConfig
		);
		const data = await result.json();
		console.log(data);
	};
	const handleListMovement = async (
		sourceListId,
		sourceIndex,
		destinationListId,
		destinationIndex
	) => {
		if (sourceListId === destinationListId) {
			return;
		}
		const newDestination = [...activityLists[destinationListId].campers];
		const newSource = [...activityLists[sourceListId].campers];
		const camper = newSource.splice(sourceIndex, 1)[0];
		newDestination.splice(destinationIndex, 0, camper);
		updateActivityAttendance(
			sourceListId,
			destinationListId,
			newSource,
			newDestination
		);
		if (destinationListId === "unassigned") {
			return;
		}
		await addCamperActivityToDB(camper.id, destinationListId, periodID);
	};
	return (
		<DragDropContext
			onDragEnd={({ source, destination }) => {
				if (!destination) {
					return;
				}
				handleListMovement(
					source.droppableId,
					source.index,
					destination.droppableId,
					destination.index
				);
			}}
		>
			<h1 tw="font-bold">Cabin {`${cabinName.toUpperCase()}`}</h1>
			<h2>Select Activities</h2>
			<div tw=" flex-col md:flex-row flex justify-center  m-2 ">
				{activityLists.unassigned &&
					activityLists.unassigned.campers.length > 0 && (
						<div tw="w-full my-2 md:mx-2">
							<Droppable droppableId="unassigned">
								{(provided, snapshot) => (
									<ActivityList
										blue
										isDraggingOver={snapshot.isDraggingOver}
										ref={provided.innerRef}
										{...provided.droppableProps}
									>
										<header tw="w-full font-bold ">
											<h2>Unassigned</h2>
										</header>
										{activityLists.unassigned &&
											activityLists.unassigned.campers.map(
												(c, index) => (
													<Draggable
														index={index}
														draggableId={`${c.id}`}
														key={`unassigned-draggable-${c.id}`}
													>
														{(
															provided,
															snapshot
														) => (
															<CamperItem
																{...provided.dragHandleProps}
																{...provided.draggableProps}
																ref={
																	provided.innerRef
																}
																isDragging={
																	snapshot.isDragging
																}
															>
																{c.firstName}{" "}
																{c.lastName}
															</CamperItem>
														)}
													</Draggable>
												)
											)}
										{provided.placeholder}
									</ActivityList>
								)}
							</Droppable>
						</div>
					)}
				<div tw="gap-2 flex flex-row md:flex-col w-full my-2 md:mx-2 flex-wrap ">
					{activityLists.activityIds &&
						activityLists.activityIds.map((aid, index) => (
							<Droppable
								key={`activity-container=${index}`}
								droppableId={`${aid}`}
							>
								{(provided, snapshot) => (
									<ActivityList
										tw="flex-grow"
										isDraggingOver={snapshot.isDraggingOver}
										ref={provided.innerRef}
										{...provided.droppableProps}
									>
										<header>
											<h2 tw="font-bold">
												{activityLists[
													aid
												].name.toUpperCase()}
											</h2>
										</header>
										{activityLists[aid].campers.map(
											(c, index) => (
												<Draggable
													draggableId={`${c.id}`}
													index={index}
													key={`draggable-camper-${c.id}`}
												>
													{(provided, snapshot) => (
														<CamperItem
															isDragging={
																snapshot.isDragging
															}
															{...provided.dragHandleProps}
															{...provided.draggableProps}
															ref={
																provided.innerRef
															}
														>
															{c.firstName}{" "}
															{c.lastName}
														</CamperItem>
													)}
												</Draggable>
											)
										)}
										{/* {provided.placeholder} */}
									</ActivityList>
								)}
							</Droppable>
						))}
				</div>
			</div>
		</DragDropContext>
	);
};

export default SelectActivities;
