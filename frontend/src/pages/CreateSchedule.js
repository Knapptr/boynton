import { Link, Outlet, useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { useState } from "react";
import SelectActivities from "../components/SelectActivities";

const Days = tw.ul` flex justify-center`;
const Day = styled.li(({ isSelected }) => [
	tw`p-2`,
	isSelected && tw`bg-red-200`,
]);
const Periods = tw.ul`flex justify-center`;
const Period = styled.li(({ isSelected }) => [
	tw` p-2`,
	isSelected && tw`bg-green-200`,
]);
const CabinNav = styled.nav(({ isOpen }) => [
	tw`hidden md:block`,
	isOpen && tw`block`,
]);
const CabinLink = styled.li(({ isSelected }) => [
	isSelected && tw`bg-purple-200`,
]);

const Activities = tw.ul`flex`;
const Activity = tw.li``;

const CreateSchedulePage = () => {
	const [selectedDay, setSelectedDay] = useState(undefined);
	const [selectedPeriod, setSelectedPeriod] = useState(undefined);
	const { weekNumber, cabin } = useParams();
	const [week, setWeek] = useGetDataOnMount({
		url: `/api/weeks/${weekNumber}`,
		runOn: [weekNumber, cabin],
		initialState: {},
	});
	const [cabins, setCabins] = useGetDataOnMount({
		url: `/api/cabin-sessions?week=${weekNumber}`,
		initialState: [],
		optionalSortFunction: (cab) => {
			if (cab.cabinArea === "GA") {
				return -1;
			} else {
				return 1;
			}
		},
	});
	//currently sending a request that 500s on mount...fix
	const [activities, setActivities] = useGetDataOnMount({
		url: `/api/activities?period=${selectedPeriod}`,
		runOn: [selectedPeriod],
		initialState: [],
	});
	const [showCabinNav, setShowCabinNav] = useState(false);
	return (
		<div tw="flex flex-col justify-center">
			<button
				onClick={() => setShowCabinNav((s) => !s)}
				tw="block md:hidden"
			>
				{showCabinNav ? "Hide Cabins" : "Show Cabins"}
			</button>
			<CabinNav isOpen={showCabinNav}>
				<ul tw="flex justify-center flex-wrap">
					{cabins.map((cabinLink, index) => {
						return (
							<CabinLink
								key={`cabin-link-${index}`}
								isSelected={cabinLink.cabinName === cabin}
								tw="mx-2 px-2 py-1 rounded"
							>
								<Link
									to={`../sign-up/${cabinLink.cabinName}/${weekNumber}`}
								>
									{cabinLink.cabinName}
								</Link>
							</CabinLink>
						);
					})}
				</ul>
			</CabinNav>
			<Days>
				{week.days &&
					week.days.map((day, index) => (
						<Day
							key={`selectDay-${index}`}
							isSelected={selectedDay === day.dayID}
							onClick={() => {
								setSelectedDay(day.dayID);
								setSelectedPeriod(day.periods[0].id);
							}}
						>
							{day.dayName}
						</Day>
					))}
			</Days>
			{selectedDay && (
				<Periods>
					{week.days
						.find((d) => d.dayID === selectedDay)
						.periods.map((period, index) => (
							<Period
								isSelected={selectedPeriod === period.id}
								onClick={() => {
									setSelectedPeriod(period.id);
								}}
								key={`period-${index}`}
							>
								Activity Period {period.periodNumber}
							</Period>
						))}
				</Periods>
			)}
			{selectedPeriod && (
				<SelectActivities cabinName={cabin} periodID={selectedPeriod} />
			)}
		</div>
	);
};

export default CreateSchedulePage;
