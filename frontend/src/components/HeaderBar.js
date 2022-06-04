import logo from "../cl.png";
import tw from "twin.macro";
import "styled-components/macro";
import { Link } from "react-router-dom";

const HeaderBar = () => {
	return (
		<>
			<div tw="flex justify-end p-2 bg-white">
				<Link tw="w-1/6 md:w-1/12 ml-auto mr-3" to="/">
					<img tw="" src={logo} alt="Camp Leslie" />
				</Link>
			</div>
		</>
	);
};

export default HeaderBar;
