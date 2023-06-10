import { Outlet } from "react-router-dom";
import HeaderBar from "./HeaderBar";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const NavWrapper = () => {
	return (
		<>
			<HeaderBar />
			<div tw="max-w-6xl mx-auto">
				<div tw="w-full flex flex-col items-center">
					<Outlet />
				</div>
			</div>
			{/* <footer tw="mt-2 h-1"></footer> */}
		</>
	);
};

export default NavWrapper;
