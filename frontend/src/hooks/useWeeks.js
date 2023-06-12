import { Accordion, AccordionDetails, AccordionSummary, Box, Fade, Skeleton, Slide, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";

const useWeeks = () => {
	const auth = useContext(UserContext);
	const [weeks, setWeeks] = useState([]);
	const [selectedWeekIndex, setSelectedIndex] = useState(null);
	const [selectedDayIndex, setSelectedDayIndex] = useState(null);
	const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(null);

	const selectedWeek = useCallback(() => {
		if (selectedWeekIndex === null) { return null };
		return weeks[selectedWeekIndex];
	}, [selectedWeekIndex, weeks])

	const selectedDay = useCallback(() => {
		if (selectedWeekIndex === null || selectedDayIndex === null) { return null };
		return selectedWeek().days[selectedDayIndex]
	}, [selectedDayIndex, selectedWeekIndex, selectedWeek])

	const selectedPeriod = useCallback(() => {
		if (selectedWeekIndex === null || selectedDayIndex === null || selectedPeriodIndex === null) { return null };
		return selectedDay().periods[selectedPeriodIndex];
	}, [selectedDay, selectedDayIndex, selectedPeriodIndex, selectedWeekIndex])

	const clearSelection = () => {
		setSelectedPeriodIndex(null);
		setSelectedDayIndex(null);
		setSelectedIndex(null);
	}

	const handleWeekSelect = (e, value) => {
		setSelectedIndex(value);
		setSelectedDayIndex(null);
		setSelectedPeriodIndex(null);
	}
	const handleDaySelect = (e, value) => {
		setSelectedDayIndex(value);
		setSelectedPeriodIndex(null);
	}
	const handlePeriodSelect = (e, value) => {
		setSelectedPeriodIndex(value);
	}

	const getWeeks = useCallback(async () => {
		const weekResponse = await fetchWithToken("/api/weeks", {}, auth);
		const weeks = await weekResponse.json();
		setWeeks(weeks);
	}, [auth])

	useEffect(() => {
		getWeeks();
	}, [getWeeks])

	//select current on load
	useEffect(() => {
		// console.log("Running automagic")
		/** Select the current week on load, if it exists
			* @param weeks the weeks
			* @returns the week OR false
		*/
		const autoMagicSelectCurrent = (weeks) => {
			const rn = new Date();
			const weekIndex = weeks.findIndex((week) => rn < new Date(week.ends) && rn > new Date(week.begins));
			if (weekIndex === -1) { return null }
			return weekIndex
		}
		setSelectedIndex(autoMagicSelectCurrent(weeks));
	}, [weeks])


	const WeekSelection = ({ noLabel, labelElement }) => {
		return (<Box >
			<Stack direction="row" justifyContent="center" flexWrap="wrap" alignItems="center" width={1}>
				{!noLabel && <Typography variant="p" component="h4" paddingX={2}>Week</Typography>}
				{labelElement}
				<ToggleButtonGroup onChange={handleWeekSelect} value={selectedWeekIndex} exclusive>
					{weeks && weeks.map((w, wIndex) => (
						<ToggleButton key={`week-select-${w.number}`} tw="bg-green-600 hover:bg-green-400" value={wIndex}>
							{w.display}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Stack>

		</Box >)
	}

	const DaySelection = ({ noLabel, labelElement }) => {
		const [open, setOpen] = useState(false);
		useEffect(() => {
			if (selectedWeek()) {
				setOpen(true)
			} else {
				setOpen(false)
			}
		})
		return (<Box >
			<Fade in={open}>
				<Stack direction="row" justifyContent="center" flexWrap="wrap" alignItems="center" width={1}>
					{!noLabel && <Typography variant="p" component="h4" >Day</Typography>}
					{labelElement}
					<ToggleButtonGroup onChange={handleDaySelect} value={selectedDayIndex} exclusive>
						{selectedWeek() && selectedWeek().days.map((d, dIndex) => (
							<ToggleButton key={`week-select-${d.id}`} tw="bg-green-600 hover:bg-green-400" value={dIndex}>
								{d.name}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Stack>
			</Fade>

		</Box>)
	}

	const PeriodSelection = ({ noLabel, labelElement }) => {
		const [open, setOpen] = useState(false);
		useEffect(() => {
			if (selectedDay()) {
				setOpen(true);
			} else {
				setOpen(false);
			}
		}, [])

		return (<Box >
			<Fade in={open}>
				<Stack direction="row" justifyContent="center" flexWrap="wrap" alignItems="center" width={1}>
					{!noLabel && <Typography variant="p" component="h4" >Period</Typography>}
					{labelElement}
					<ToggleButtonGroup onChange={handlePeriodSelect} value={selectedPeriodIndex} exclusive>
						{selectedDay() && selectedDay().periods.map((p, pIndex) => (
							<ToggleButton key={`week-select-${p.id}`} tw="bg-green-600 hover:bg-green-400" value={pIndex}>
								Act {p.number}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Stack>
			</Fade>
		</Box>)
	}

	return {isSelected: selectedWeekIndex !== null, weeks, clearSelection, WeekSelection, DaySelection, PeriodSelection, selectedWeek, selectedDay, selectedPeriod, setWeeks, };
}

export default useWeeks;
