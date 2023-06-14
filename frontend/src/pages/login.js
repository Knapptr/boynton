import Login from "../components/login";
import {Container} from "@mui/material"
import "styled-components/macro";
import { BoyntonHeader } from "../components/styled";
import { Box } from "@mui/system";
const LoginPage = () => {
	return (
		<>
		<Container maxWidth="lg">
		<Box display="flex" justifyContent="center" mt={6}>
				<Login />
		</Box>
			</Container>
		</>
	);
};

export default LoginPage;
