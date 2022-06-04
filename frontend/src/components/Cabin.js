import { Droppable } from "@react-forked/dnd";
import Camper from "./Camper";
import { useState, useEffect } from "react";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const RemoveButton = tw.button`rounded bg-red-500 text-white p-1 m-0.5 hover:bg-red-700`;

const CabinWrapper = styled.div(({ isOpen, disabled, isOver }) => [
	tw`select-none p-2 flex flex-col bg-sky-600 border border-sky-700  `,
	disabled && tw`bg-red-300`,
	isOver && tw`bg-sky-800 border-sky-900`,
]);
const CamperList = styled.div(({ isOpen, hasCampers }) => [
	tw`p-1 rounded flex-grow flex flex-col gap-1`,
	hasCampers && isOpen && tw`bg-sky-800`,
]);
const Cabin = ({ session, list, allOpenState, unassignCamper }) => {
	const [isOpen, setIsOpen] = useState(false);
	const toggleOpen = () => {
		setIsOpen((o) => !o);
	};
	useEffect(() => {
		setIsOpen(allOpenState);
	}, [allOpenState]);

	return (
		<div tw="w-1/2 md:w-1/6">
			<Droppable
				isDropDisabled={list.length === session.capacity}
				droppableId={`${session.cabinName}`}
			>
				{(provided, snapshot) => (
					<CabinWrapper
						isOver={snapshot.isDraggingOver}
						{...isOpen}
						{...provided.droppableProps}
						ref={provided.innerRef}
						disabled={list.length === session.capacity}
					>
						<header tw="flex justify-between">
							<h4 tw="font-bold text-xl">{session.cabinName}</h4>
							<h4 tw="font-bold text-2xl">
								{list.length}/{session.capacity}
							</h4>
						</header>
						<div tw="flex justify-end">
							{list.length > 0 && !allOpenState && (
								<button onClick={toggleOpen}>
									{isOpen ? "Hide List" : "View List"}
								</button>
							)}
							<h4 tw="ml-auto">
								{list.length <= 0
									? "Empty"
									: `Ages: ${list[0].age} - ${
											list[list.length - 1].age
									  }`}
							</h4>
						</div>
						<CamperList
							isOpen={isOpen}
							hasCampers={list.length > 0}
						>
							{/* {isOpen && provided.placeholder} */}
							{isOpen &&
								list.map((camper, index) => {
									return (
										<div
											key={`remove-${camper.id}`}
											tw="flex align-middle bg-green-300"
										>
											<RemoveButton
												onClick={() => {
													unassignCamper(
														camper,
														index,
														session.cabinName
													);
												}}
											>
												X
											</RemoveButton>
											<Camper
												grow
												key={`camper-${camper.id}`}
												{...camper}
												index={index}
											/>
										</div>
									);
								})}
						</CamperList>
					</CabinWrapper>
				)}
			</Droppable>
		</div>
	);
};

export default Cabin;
