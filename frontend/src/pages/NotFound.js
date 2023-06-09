import { Container, Box, Card, Paper, Typography, Divider } from '@mui/material';
import tw from "twin.macro";
import "styled-components/macro";
import { Link } from 'react-router-dom';

const NotFound = () => {
	return <>
		<Container >
			<Box >
				<Card raised tw="mt-24 bg-green-600 flex flex-col py-24 px-2 justify-center items-center">
					<Typography variant='h3' color="White" component="h1" tw="mb-4">Not Found</Typography>
					<Typography variant='h5' component="p">That page does not exist. Bummer.</Typography>
					<Divider tw="w-8/12 mt-12 mb-16" />
					<Link to="/">
						<Typography variant='h6' component="a">Go back, in shame.</Typography>
					</Link>
				</Card>
			</Box>
		</Container>
	</>
};

export default NotFound;
