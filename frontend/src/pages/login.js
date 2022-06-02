import Login from "../components/login";
import tw from "twin.macro";
import "styled-components/macro";
import { BoyntonHeader } from "../components/styled";
const LoginPage = () => {
	return (
		<>
			<div tw=" flex flex-col justify-center items-center min-h-screen  ">
				<Login />
			</div>
		</>
	);
};

export default LoginPage;
