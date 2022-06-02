import { Droppable } from "@react-forked/dnd";
import Camper from "./Camper";
import { useState, useEffect } from "react";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const camperIcons = ["😎", "🤓", "😁", "🙄", "😆", "😏"];

const RemoveButton = tw.button`rounded bg-red-500 text-white p-1 m-0.5 hover:bg-red-700`;

const CabinWrapper = styled.div(({ isOpen, disabled, isOver }) => [
	tw`select-none p-2 flex flex-col my-2 w-full flex-grow bg-sky-600 border border-sky-700 md:flex-grow-0 md:w-1/4 `,
	disabled && tw`bg-red-300`,
	isOver && tw`bg-sky-800 border-sky-900`,
]);
const CamperList = styled.div(({ isOpen, hasCampers }) => [
	tw`p-0.5 rounded flex-grow`,
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
		<Droppable
			isDropDisabled={list.length === session.capacity}
			droppableId={`${session.cabinName}_DROP`}
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
					<div tw="flex justify-between">
						{list.length > 0 ? (
							<button onClick={toggleOpen}>
								{isOpen ? "Hide List" : "View List"}
							</button>
						) : (
							<p>No Campers</p>
						)}
						<h4>
							{list.length <= 0
								? "No ages"
								: `Ages: ${list[0].age} - ${
										list[list.length - 1].age
								  }`}
						</h4>
					</div>
					<CamperList isOpen={isOpen} hasCampers={list.length > 0}>
						{/* {isOpen && provided.placeholder} */}
						{isOpen &&
							list.map((camper, index) => {
								return (
									<div
										key={`remove-${camper.id}`}
										tw="flex align-middle"
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
	);
};

export default Cabin;
