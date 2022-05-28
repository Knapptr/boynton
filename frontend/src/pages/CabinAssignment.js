import useGetDataOnMount from "../hooks/useGetData";
import Campers from "../components/Campers";
import Cabins from "../components/Cabins";
import { DragDropContext } from "@react-forked/dnd";
import { Route } from "react-router-dom";
import tw from "twin.macro";
import "styled-components/macro";
import useCabinSessions from "../hooks/useCabinSessions";

const Columns = tw.div`flex flex-col`;
export const Column = tw.div`w-1/5`;
const areas = ["ba", "ga"];
const weeks = ["1", "2", "3", "4", "5", "6"];

const CabinAssignmentRoutes = () => {
	const routes = [];
	for (const week of weeks) {
		for (const area of areas) {
			routes.push(
				<Route
					key={`cabinRoute-${area}${week}]`}
					path={`/cabin-assignment/${area}/${week}`}
					element={<CabinAssignment area={area} weekNumber={week} />}
				/>
			);
		}
	}
	return routes;
};
const CabinAssignment = ({ area, weekNumber }) => {
	const { cabinSessions, cabinList, updateCabinList, setCabinList } =
		useCabinSessions(weekNumber, area);
	const [allCampers] = useGetDataOnMount({
		url: `/api/camper-weeks?week=${weekNumber}&area=${area}`,
		initialState: [],
	});
	const [unassignedCampers, setCampers] = useGetDataOnMount({
		url: `/api/camper-weeks?week=${weekNumber}&area=${area}&cabin=unassigned`,
		initialState: [],
		optionalSortFunction: (camper1, camper2) => camper1.age - camper2.age,
	});

	const unassignCamper = (camperSession, camperIndex, cabinName) => {
		dragOptions.cabinToCampers({
			sourceList: cabinName,
			destinationList: "campers",
			destinationIndex: 0,
			sourceIndex: camperIndex,
		});
	};

	const unassignAll = async () => {
		let campers = [...unassignedCampers];
		let newlyUnassignedCampers = [];
		let updatedCabinList = { ...cabinList };
		console.log({ cabinSessions });
		for (let cabin of cabinSessions) {
			newlyUnassignedCampers = [
				...newlyUnassignedCampers,
				...cabinList[cabin.cabinName],
			];
			updatedCabinList[cabin.cabinName] = [];
		}
		for (let camper of newlyUnassignedCampers) {
			await assignCabin(camper, false);
		}
		campers = [...campers, ...newlyUnassignedCampers];
		setCampers(campers);
		setCabinList(updatedCabinList);
	};
	const assignCabin = async (camperSession, cabinNumber) => {
		//get id from sessions
		const cabinSession =
			cabinSessions.find((cabin) => cabin.cabinName === cabinNumber) ||
			null;
		const requestConfig = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				cabinSessionID: cabinSession ? cabinSession.id : null,
			}),
		};
		const results = await fetch(
			`/api/campers/${camperSession.camperID}/${camperSession.id}/cabin`,
			requestConfig
		);
		console.log(results);
	};

	const dragOptions = {
		campersToCabin({
			sourceList,
			destinationList,
			sourceIndex,
			destinationIndex,
		}) {
			const destinationItems = [...unassignedCampers];
			const sourceItems = [...cabinList[destinationList]];
			const camper = destinationItems.splice(sourceIndex, 1)[0];
			sourceItems.splice(destinationIndex, 0, camper);
			assignCabin(camper, destinationList);
			updateCabinList(destinationList, sourceItems);
			setCampers([...destinationItems]);
		},
		cabinToCampers({
			sourceList,
			destinationList,
			sourceIndex,
			destinationIndex,
		}) {
			const destinationItems = [...unassignedCampers];
			const sourceItems = [...cabinList[sourceList]];
			const camper = sourceItems.splice(sourceIndex, 1)[0];
			destinationItems.splice(destinationIndex, 0, camper);
			assignCabin(camper, false);
			updateCabinList(sourceList, sourceItems);
			setCampers([...destinationItems]);
		},
		cabinToCabin({
			sourceList,
			destinationList,
			sourceIndex,
			destinationIndex,
		}) {
			const sourceItems = [...cabinList[sourceList]];
			const destinationItems = [...cabinList[destinationList]];
			const camper = sourceItems.splice(sourceIndex, 1)[0];
			destinationItems.splice(destinationIndex, 0, camper);
			assignCabin(camper, destinationList);
			updateCabinList(
				destinationList,
				destinationItems,
				sourceList,
				sourceItems
			);
			return;
		},
	};
	const dragCamper = ({ source, destination }) => {
		// console.log({ source, destination });
		if (!destination) {
			return;
		}
		const dragData = {
			sourceList: source.droppableId.split("_")[0],
			destinationList: destination.droppableId.split("_")[0],
			sourceIndex: source.index,
			destinationIndex: destination.index,
		};
		if (dragData.sourceList === dragData.destinationList) {
			return;
		}
		if (dragData.sourceList === "campers") {
			dragOptions.campersToCabin(dragData);
			return;
		}
		if (dragData.destinationList === "campers") {
			dragOptions.cabinToCampers(dragData);
			return;
		}
		dragOptions.cabinToCabin(dragData);
	};

	return (
		<div tw="flex flex-col md:flex-row md:items-stretch h-screen max-w-6xl justify-center m-auto">
			<DragDropContext
				onDragEnd={(drop) => {
					dragCamper(drop);
				}}
			>
				<div tw="max-h-72 md:max-h-full overflow-auto min-h-[200px] md:min-h-0 md:mx-4 lg:mx-8">
					<Campers
						list={unassignedCampers}
						allCampers={allCampers}
						weekNumber={weekNumber}
						area={area}
					/>
				</div>
				<Cabins
					unassignCamper={unassignCamper}
					cabinSessions={cabinSessions}
					lists={cabinList}
					weekNumber={weekNumber}
					area={area}
					unassignAll={unassignAll}
				/>
			</DragDropContext>
		</div>
	);
};

export default CabinAssignmentRoutes;
