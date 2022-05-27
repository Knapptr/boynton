import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import { Link, Route, Routes, BrowserRouter } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@react-forked/dnd";
const fetchAndSetData = async (url, handler, callback) => {
	const response = await fetch(url);
	const data = await response.json();
	handler(data);
	console.log({ data });
	callback(data);
};

const Cabins = ({ cabinCallback, lists }) => {
	const [cabinSessions, setCabinSessions] = useState(null);
	useEffect(() => {
		console.log("effect runs");
		fetchAndSetData(
			"/api/cabin-sessions?area=BA&week=1",
			setCabinSessions,
			cabinCallback
		);
	}, []);
	return (
		cabinSessions &&
		cabinSessions.map((cabinSession) => {
			return (
				<div>
					<h2>Cabin {cabinSession.cabinName}</h2>
					<Droppable droppableId={`${cabinSession.cabinName}_DROP`}>
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
							>
								{provided.placeholder}
								{lists &&
									lists[cabinSession.cabinName].map(
										(camper) => (
											<p>
												{camper.firstName} -{" "}
												{camper.age}
											</p>
										)
									)}
							</div>
						)}
					</Droppable>
				</div>
			);
		})
	);
};
const Campers = () => {
	const [campers, setCampers] = useState(null);
	const [cabinLists, setCabinLists] = useState([]);
	useEffect(() => {
		fetchAndSetData("/api/campers?week=1&area=ba", setCampers);
	}, []);

	const setupCabinLists = (cabins) => {
		const data = {};
		for (let cabin of cabins) {
			if (!data[cabin.cabinName]) {
				data[cabin.cabinName] = [];
			}
		}
		setCabinLists(data);
	};

	const addCamperToList = (camper, dropID) => {
		const cabinNameFromDrop = dropID.split("_")[0];
		console.log({ camper }, { cabinNameFromDrop });
		const cabinList = [...cabinLists[cabinNameFromDrop]];
		cabinList.push(camper);
		setCabinLists({
			...cabinLists,
			[cabinNameFromDrop]: cabinList,
		});
	};
	return (
		campers && (
			<DragDropContext
				onDragEnd={(drop) => {
					const { source, destination } = drop;
					console.log(source, destination);
					if (
						!destination ||
						source.index === destination.index ||
						source.droppableId === destination.droppableId
					) {
						return;
					}
					const newCampers = [...campers];
					const moved = newCampers.splice(source.index, 1)[0];
					setCampers(newCampers);
					addCamperToList(moved, destination.droppableId);
				}}
			>
				<Droppable droppableId="dropHere">
					{(provided) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
						>
							{campers.map((camper, index) => (
								<Camper {...camper} index={index} />
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
				<div>
					<Cabins
						cabinCallback={cabinLists ? setupCabinLists : () => {}}
						lists={cabinLists}
					/>
				</div>
			</DragDropContext>
		)
	);
};
const Container = (props) => {
	return (
		<div ref={props.innerRef} {...props}>
			{props.children}
		</div>
	);
};
const Camper = ({ firstName, lastName, age, id, index }) => {
	return (
		<Draggable key={id} draggableId={`${id}`} index={index}>
			{(provided) => {
				return (
					<div
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						ref={provided.innerRef}
					>
						<p>
							{firstName} {lastName} {age}
						</p>
					</div>
				);
			}}
		</Draggable>
	);
};
function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<Routes>
					<Route path="campers" element={<Campers />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
