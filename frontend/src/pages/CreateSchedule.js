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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faForwardStep, faBackwardStep } from '@fortawesome/free-solid-svg-icons'

const Periods = tw.ul` gap-2 flex justify-center`;

const dayAbbrev = {
	MON: "Monday",
	TUE: "Tuesday",
	WED: "Wednesday",
	THU: "Thursday",
	FRI: "Friday",
};

const NextButton = styled.button(({ disabled }) => [
	tw`self-end py-2 px-4 bg-green-100 rounded shadow transition-colors mx-2 text-black`,
	disabled && tw`bg-gray-500 cursor-default text-gray-600`

]);
const Controls = styled.nav(({ showControls }) => [
	tw`hidden`,
	showControls && tw`block`,
]);

const CreateSchedulePage = () => {
	const [selectedDay, setSelectedDay] = useState(0);
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
	const selectNext = (numberToIncrement) => {
		const currentDayIndex = selectedDay;
		const currentPeriods = week.days[currentDayIndex].periods;
		const currentPeriodIndex = selectedPeriod;
		const nextPeriodIndex = currentPeriodIndex + numberToIncrement
		const itIsTheLastPeriod = currentPeriods.length === nextPeriodIndex;
		const itIstheFirstPeriod = currentPeriodIndex === 0

		if (!itIsTheLastPeriod && nextPeriodIndex >= 0) {
			setSelectedPeriod(nextPeriodIndex);
			return;

		} else {
			const nextIndex = currentDayIndex + numberToIncrement;
			const thereIsANextDay = week.days[nextIndex] !== undefined
			const periodToChoose = numberToIncrement > 0 ? 0 : week.days[nextIndex].periods.length - 1
			if (thereIsANextDay) {
				setSelectedDay(nextIndex);
				setSelectedPeriod(periodToChoose);
			}
		}
	};

	return (
		<div tw="flex flex-col justify-center min-h-screen">
			<header tw="mb-3 flex items-center justify-around">
				<h1 tw="font-bold text-3xl">Cabin {`${toTitleCase(cabin)}`}</h1>
				<h5 tw="text-xl font-bold text-gray-600">Week {weekNumber}</h5>
			</header>
			<div tw="mx-auto flex w-full md:w-2/3 justify-between bg-green-700 p-2 font-bold text-white">
				<NextButton
					disabled={selectedDay === 0 && selectedPeriod === 0}
					previous
					onClick={() => {
						selectNext(-1);
					}}
				>
					<FontAwesomeIcon icon={faBackwardStep} />
				</NextButton>
				{week.days &&
					<div tw="flex flex-col justify-center">
						<h1 >{dayAbbrev[week.days[selectedDay].name]}</h1>
						<h1>Activity Period {week.days[selectedDay].periods[selectedPeriod].number
						}</h1>
					</div>
				}
				<NextButton
					disabled={isTheLastPeriod()}
					onClick={() => {
						selectNext(1);
					}}
				>
					<FontAwesomeIcon icon={faForwardStep} />
				</NextButton>
			</div>
			{weekLoaded && (
				<div tw="flex-grow ">
					<SelectActivities
						selectNext={selectNext}
						isTheLastPeriod={isTheLastPeriod}
						dayName={week.days[selectedDay].name}
						periodNumber={
							week.days[selectedDay].periods[selectedPeriod].number
						}
						cabinName={cabin}
						periodId={
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
						{showControls ? "Hide" : "More Options"}
					</button>
				</div>
			)}
		</div>
	);
};

export default CreateSchedulePage;
