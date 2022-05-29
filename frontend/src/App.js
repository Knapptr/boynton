import "./App.css";
import { Link, Route, Routes, BrowserRouter } from "react-router-dom";
import CabinAssignmentRoutes from "./pages/CabinAssignment";
import NotFound from "./pages/NotFound";
import ScheduleRoutes from "./pages/ScheduleRoutes";
function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<Routes>
					<Route path="/cabins/*">{CabinAssignmentRoutes()}</Route>
					<Route path="/schedule/*" element={<ScheduleRoutes />} />

					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
