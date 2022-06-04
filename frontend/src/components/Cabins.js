import { useEffect, useState } from "react";
import useGetDataOnMount from "../hooks/useGetData";
import Cabin from "./Cabin";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { AssignmentHeader } from "./styled";

const CabinsExpander = styled.div(({ expand }) => [
	expand && tw`absolute top-0 h-full`,
]);
const CabinsList = styled.div(() => [tw`w-full bg-sky-300 flex flex-wrap`]);

const Button = styled.button(() => [tw`bg-green-600 rounded text-white p-2`]);
const Cabins = ({ unassignAll, cabinSessions, lists, unassignCamper }) => {
	// console.log({ cabinSessions, lists });
	const [hideFull, setHideFull] = useState(false);
	const [allOpen, setAllOpen] = useState(false);
	const toggleAllOpen = () => {
		setAllOpen((o) => !o);
	};
	const areEmpty = () => {
		console.log({ cabinSessions, lists });
		if (Object.keys(lists).length === 0 || cabinSessions.length === 0) {
			return true;
		}
		return cabinSessions.every((cabin) =>
			lists[cabin.cabinName].every((list) => list.length === 0)
		);
	};
	const displayCabins = () => {
		let list = cabinSessions;
		if (hideFull) {
			console.log({ cabinSessions, lists });
			list = cabinSessions.filter(
				(cabin) => cabin.capacity > lists[cabin.cabinName].length
			);
		}
		return list.map((cabinSession) => {
			return (
				<Cabin
					key={`cabin-${cabinSession.cabinName}`}
					unassignCamper={unassignCamper}
					allOpenState={allOpen}
					session={cabinSession}
					list={lists[cabinSession.cabinName].sort(
						(camper1, camper2) => camper1.age > camper2.age
					)}
				/>
			);
		});
	};
	return (
		<>
			<CabinsExpander expand={allOpen} tw="w-full">
				<AssignmentHeader tw="w-full">
					<h2 tw="font-bold text-lg">Cabins</h2>
					<Button onClick={toggleAllOpen}>
						{allOpen ? "Show Unassigned" : "Show Cabins Only"}
					</Button>
					<div>
						<label htmlFor="hideFullToggle">Hide Full</label>
						<input
							tw="m-1"
							id="hideFullToggle"
							type="checkbox"
							value={hideFull}
							onChange={() => {
								setHideFull((f) => !f);
							}}
						/>
					</div>
				</AssignmentHeader>
				<CabinsList>{cabinSessions && displayCabins()}</CabinsList>
				{!areEmpty() && (
					<button
						tw="bg-red-600 p-2 w-full font-bold text-white"
						onClick={unassignAll}
					>
						Unassign All
					</button>
				)}
			</CabinsExpander>
		</>
	);
};

export default Cabins;
