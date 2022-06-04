import { Outlet } from "react-router-dom";
import HeaderBar from "./HeaderBar";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const NavWrapper = () => {
	return (
		<>
			<div tw="max-w-6xl mx-auto">
				<HeaderBar />
				<Outlet />
				{/* <footer tw="mt-2 h-1"></footer> */}
			</div>
		</>
	);
};

export default NavWrapper;
