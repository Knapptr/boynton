import "./App.css";
import { Link, Route, Routes, BrowserRouter } from "react-router-dom";
import CabinAssignmentRoutes from "./pages/CabinAssignment";
import NotFound from "./pages/NotFound";
import ScheduleRoutes from "./pages/ScheduleRoutes";
import LoginPage from "./pages/login";
import NavWrapper from "./components/NavWrapper";
import Protected from "./components/Protected";
function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/" element={<NavWrapper />}>
						<Route path="/cabins/*">
							{CabinAssignmentRoutes()}
						</Route>
						<Route
							path="/schedule/*"
							element={
								<Protected>
									<ScheduleRoutes />
								</Protected>
							}
						/>
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;