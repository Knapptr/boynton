import { Outlet } from "react-router-dom";
import HeaderBar from "./HeaderBar";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const NavWrapper = () => {
	return (
		<>
			<HeaderBar />
			<div tw="max-w-4xl mx-auto">
				<Outlet />
			</div>
			{/* <footer tw="mt-2 h-1"></footer> */}
		</>
	);
};

export default NavWrapper;
