import tw from "twin.macro";
import "styled-components/macro";
import { Alert, AlertTitle, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Stack } from "@mui/system";
import { useState } from "react"

const usePops = () => {
	const [errors, setErrors] = useState([]);
	const [success, setSuccess] = useState([]);
	const thereAreSuccess = () => success.length > 0;
	const thereAreErrors = () => errors.length > 0;
	const clearSuccess = () => { setSuccess([]) };
	const clearErrors = () => { setErrors([]); };

	const clearPops = () => {
		clearSuccess();
		clearErrors();
	}

	const greatSuccess = (title, message) => {
		setSuccess([{ title, message }]);
	}
	const shamefulFailure = (title, message) => {
		setErrors([{ title, message }]);
	}

	const mapPops = (list, type) => {
		return list.map(item =>
			<Alert severity={type} action={<IconButton onClick={clearPops}> <CloseIcon /> </IconButton>}>
				<Box>
				</Box>
				<AlertTitle>
					{item.title}
				</AlertTitle>
				{item.message}
			</Alert>)
	}
	const PopsBar = () => {
		return (<>
			<Box position="fixed" bottom={10} width={1} zIndex={100}>
				<Stack spacing={2} width={1} justifyContent="center" alignItems="center"  >
					{mapPops(success, "success")}
					{mapPops(errors, "error")}
				</Stack>
			</Box>
		</>)
	}
	return { PopsBar, shamefulFailure, greatSuccess, clearPops }

}

export default usePops;
