import { Container, Box, Card, Typography, Divider, Button } from '@mui/material';

const NotFound = () => {
	return <>
		<Container >
			<Box mt={4} >
				<Card raised sx={{backgroundColor:"primary.main",py:3}}>
					<Typography variant='h3' color="White" component="h1" mb={2}>Not Found</Typography>
					<Typography variant='h5' component="p">That page does not exist. Bummer.</Typography>
					<Divider sx={{marginY: 4}}/>
						<Button href="/" variant='contained' color="warning" >Go back, in shame.</Button>
				</Card>
			</Box>
		</Container>
	</>
};

export default NotFound;
