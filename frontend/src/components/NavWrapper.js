import { Outlet } from "react-router-dom";
import HeaderBar from "./HeaderBar";

const NavWrapper = () => {
	return (
		<>
			<HeaderBar />
			<Outlet />
		</>
	);
};

export default NavWrapper;
