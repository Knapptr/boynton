import Login from "../components/login";
import {Container} from "@mui/material"
import "styled-components/macro";
import { BoyntonHeader } from "../components/styled";
import { Box } from "@mui/system";
import { Helmet } from "react-helmet";
const LoginPage = () => {
	return (
		<>
		<Helmet>
		<title>Boynton: Login</title>
		<meta name="description" content="Login to Boynton"/>
		</Helmet>
		<Container maxWidth="lg">
		<Box display="flex" justifyContent="center" mt={6}>
				<Login />
		</Box>
			</Container>
		</>
	);
};

export default LoginPage;
