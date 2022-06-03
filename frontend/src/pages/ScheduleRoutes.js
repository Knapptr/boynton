import { Routes, Route, Outlet } from "react-router-dom";
import CreateSchedulePage from "./CreateSchedule";
import SignUpIndex from "./SignUpIndex";

const ScheduleRoutes = () => {
	return (
		<>
			<Routes>
				<Route
					path="sign-up/:cabin/:weekNumber"
					element={<CreateSchedulePage />}
				></Route>
				<Route path="sign-up" element={<SignUpIndex />}></Route>
			</Routes>
			<Outlet />
		</>
	);
};

export default ScheduleRoutes;
