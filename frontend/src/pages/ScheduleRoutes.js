import { Routes, Route, Outlet } from "react-router-dom";
import CreateSchedulePage from "./CreateSchedule";

const ScheduleRoutes = () => {
	return (
		<>
			<Routes>
				<Route
					path="/sign-up/:cabin/:weekNumber"
					element={<CreateSchedulePage />}
				></Route>
			</Routes>
		</>
	);
};

export default ScheduleRoutes;
