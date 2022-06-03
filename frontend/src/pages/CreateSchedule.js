import { useLocation, useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { useState, useEffect } from "react";
import SelectActivities from "../components/SelectActivities";
import CabinNav from "../components/CabinNav";
import { LabeledDivider, MenuSelector } from "../components/styled";
import DayNav from "../components/DayNav";
import PeriodNav from "../components/PeriodNav";

const Periods = tw.ul` gap-2 flex justify-center`;

const CreateSchedulePage = () => {
	const [selectedDay, setSelectedDay] = useState(0);
	const location = useLocation();

	const [selectedPeriod, setSelectedPeriod] = useState(0);
	const { weekNumber, cabin } = useParams();
	const [week, setWeek] = useGetDataOnMount({
		url: `/api/weeks/${weekNumber}`,
		runOn: [weekNumber, cabin],
		initialState: {},
		useToken: true,
	});
	const [weekLoaded, setWeekLoaded] = useState(false);
	useEffect(() => {
		if (week.days) {
			setWeekLoaded(true);
		}
	}, [week]);
	const [cabins, setCabins] = useGetDataOnMount({
		url: `/api/cabin-sessions?week=${weekNumber}`,
		useToken: true,
		initialState: [],
		optionalSortFunction: (cab) => {
			if (cab.cabinArea === "GA") {
				return -1;
			} else {
				return 1;
			}
		},
	});
	const isTheLastPeriod = () => {
		if (weekLoaded) {
			return (
				selectedDay === week.days.length - 1 &&
				selectedPeriod === week.days[selectedDay].periods.length - 1
			);
		} else {
			return false;
		}
	};
	const selectNext = () => {
		const currentDayIndex = selectedDay;
		const currentPeriods = week.days[currentDayIndex].periods;
		const currentPeriodIndex = selectedPeriod;
		const nextPeriodIndex = currentPeriodIndex + 1;
		const itIsTheLastPeriod = currentPeriods.length === nextPeriodIndex;

		if (!itIsTheLastPeriod) {
			setSelectedPeriod(nextPeriodIndex);
			return;
		} else {
			if (currentDayIndex >= 0) {
				const nextIndex = currentDayIndex + 1;
				const thereIsANextDay = week.days.length > nextIndex;
				if (thereIsANextDay) {
					setSelectedDay(nextIndex);
					setSelectedPeriod(0);
				}
			}
		}
	};

	return (
		<div tw="flex flex-col justify-center">
			{isTheLastPeriod() ? (
				<button onClick={(e) => e.preventDefault()}>The End!</button>
			) : (
				<button onClick={selectNext}>NEX</button>
			)}
			<div tw="p-3 bg-stone-100">
				<LabeledDivider text="Cabin" />
				<CabinNav
					currentCabin={cabin}
					weekNumber={weekNumber}
					cabins={cabins}
				/>
				<LabeledDivider text="Day" />
				<DayNav
					selectDay={setSelectedDay}
					selectPeriod={setSelectedPeriod}
					selectedPeriod={selectedPeriod}
					days={week.days}
					selectedDay={selectedDay}
				/>
				<LabeledDivider text="Period" />
				{weekLoaded && (
					<PeriodNav
						days={week.days}
						selectedDay={selectedDay}
						selectPeriod={setSelectedPeriod}
						selectedPeriod={selectedPeriod}
					/>
				)}
			</div>
			{weekLoaded && (
				<SelectActivities
					cabinName={cabin}
					periodID={week.days[selectedDay].periods[selectedPeriod].id}
				/>
			)}
		</div>
	);
};

export default CreateSchedulePage;
