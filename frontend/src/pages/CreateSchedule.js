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
import toTitleCase from "../toTitleCase";

const Periods = tw.ul` gap-2 flex justify-center`;

const Controls = styled.nav(({ showControls }) => [
	tw`hidden`,
	showControls && tw`block`,
]);

const CreateSchedulePage = () => {
	const [selectedDay, setSelectedDay] = useState(0);
	const location = useLocation();
	const [selectedPeriod, setSelectedPeriod] = useState(0);
	const { weekNumber, cabin } = useParams();
	const [showControls, setShowControls] = useState(false);
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
		<div tw="flex flex-col justify-center min-h-screen">
			<header tw="p-4 m-5">
				<h5 tw="italic">Week {weekNumber}</h5>
				<h1 tw="font-bold text-3xl">Cabin {`${toTitleCase(cabin)}`}</h1>
			</header>
			{weekLoaded && (
				<div tw="flex-grow ">
					<SelectActivities
						selectNext={selectNext}
						isTheLastPeriod={isTheLastPeriod}
						dayName={week.days[selectedDay].dayName}
						periodName={
							week.days[selectedDay].periods[selectedPeriod]
								.periodNumber
						}
						cabinName={cabin}
						periodID={
							week.days[selectedDay].periods[selectedPeriod].id
						}
					/>
				</div>
			)}
			{weekLoaded && (
				<div tw="p-3 bg-stone-100 sticky bottom-0">
					<Controls showControls={showControls}>
						<LabeledDivider text="Period" />
						{weekLoaded && (
							<PeriodNav
								days={week.days}
								selectedDay={selectedDay}
								selectPeriod={setSelectedPeriod}
								selectedPeriod={selectedPeriod}
							/>
						)}
						<LabeledDivider text="Day" />
						<DayNav
							selectDay={setSelectedDay}
							selectPeriod={setSelectedPeriod}
							selectedPeriod={selectedPeriod}
							days={week.days}
							selectedDay={selectedDay}
						/>
						<LabeledDivider text="Cabin" />
						<CabinNav
							currentCabin={cabin}
							weekNumber={weekNumber}
							cabins={cabins}
						/>
					</Controls>
					<button
						onClick={() => {
							setShowControls((s) => !s);
						}}
						tw=" font-thin border rounded py-2 px-4 mt-2"
					>
						{showControls ? "Hide" : "Show"} Controls
					</button>
				</div>
			)}
		</div>
	);
};

export default CreateSchedulePage;
