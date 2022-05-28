import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import { Link, Route, Routes, BrowserRouter } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@react-forked/dnd";
import Cabin from "./components/Cabin";
import Camper from "./components/Camper";
import Cabins from "./components/Cabins";
import CabinAssignmentRoutes from "./pages/CabinAssignment";
const fetchAndSetData = async (url, handler, callback) => {
	const response = await fetch(url);
	const data = await response.json();
	handler(data);
	console.log({ data });
	callback(data);
};

const Container = (props) => {
	return (
		<div ref={props.innerRef} {...props}>
			{props.children}
		</div>
	);
};
function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<Routes>{CabinAssignmentRoutes()}</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
