import tw from "twin.macro";
import "styled-components/macro";
import { Alert, AlertTitle, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Stack } from "@mui/system";
import { useState } from "react"

const useErrors = () => {
	const [errors, setErrors] = useState([]);
	const thereAreErrors = () => errors.length > 0;
	const clearErrors = () => {
		setErrors([]);
	}
	const ErrorsBar = () => {
		return (<>
			<Box tw="w-full relative mt-4">
				<Stack spacing={2} tw="w-9/12 mx-auto" >
					{errors.map(err =>
						<Alert severity="error" action={<IconButton onClick={clearErrors}> <CloseIcon /> </IconButton>}>
							<Box>
							</Box>
							<AlertTitle>
								{err.title}
							</AlertTitle>
							{err.message}
						</Alert>)}
				</Stack>
			</Box>
		</>)
	}
	return { errors, setErrors, clearErrors, thereAreErrors, ErrorsBar }

}

export default useErrors;
