import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";

const useWeeks = () => {
	const [weeks, setWeeks] = useState([]);
	const [selectedWeek, setSelectedWeek] = useState(null);

	const handleWeekSelect = ((e, selectedWeek) => {
		setSelectedWeek(selectedWeek)
	})

	const WeekSelection = ({ labelElement }) => {
		return (<Box>
			<Stack direction="row" justifyContent="center" flexWrap="wrap" alignItems="center" width={1}>
				{labelElement}
				<ToggleButtonGroup onChange={handleWeekSelect} value={selectedWeek} exclusive>
					{weeks && weeks.map(w => (
						<ToggleButton key={`week-select-${w.number}`} tw="bg-green-600 hover:bg-green-400" value={w}>{w.number}</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Stack>

		</Box>)
	}

	const auth = useContext(UserContext);

	const getWeeks = useCallback(async () => {
		const weekResponse = await fetchWithToken("/api/weeks", {}, auth);
		const weeks = await weekResponse.json();
		setWeeks(weeks);
	}, [auth])

	useEffect(() => {
		getWeeks();
	}, [getWeeks])

	return { weeks, WeekSelection, selectedWeek };
}

export default useWeeks;
