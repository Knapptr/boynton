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
			<Box tw="w-full fixed bottom-10">
				<Stack spacing={2} tw="w-9/12 mx-auto" >
					{mapPops(success, "success")}
					{mapPops(errors, "error")}
				</Stack>
			</Box>
		</>)
	}
	return { PopsBar, shamefulFailure, greatSuccess, clearPops }

}

export default usePops;
