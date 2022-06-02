import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { useState } from "react";
import SelectActivities from "../components/SelectActivities";

const Divider = styled.hr(() => [tw`my-2 flex-grow border-stone-200`]);
const LabeledDivider = ({ text }) => (
	<div tw="flex justify-center items-center my-1">
		<Divider />
		<h3 tw="mx-3 ">{text}</h3>
		<Divider />
	</div>
);
const menuColors = {
	red: tw`bg-red-200`,
	blue: tw`bg-blue-200`,
	green: tw`bg-green-200`,
};
const MenuSelector = styled.li(({ isSelected, color = "green" }) => [
	tw`border p-2 rounded`,
	isSelected && menuColors[color],
]);
const Days = tw.ul`my-1 flex gap-2 justify-center`;
const Periods = tw.ul` gap-2 flex justify-center`;
const CabinNav = tw.nav``;

const CreateSchedulePage = () => {
	const [selectedDay, setSelectedDay] = useState("");
	const location = useLocation();

	const [selectedPeriod, setSelectedPeriod] = useState("");
	const { weekNumber, cabin } = useParams();
	const [week, setWeek] = useGetDataOnMount({
		url: `/api/weeks/${weekNumber}`,
		runOn: [weekNumber, cabin],
		initialState: {},
		useToken: true,
	});
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
	const [activities, setActivities] = useGetDataOnMount({
		url: `/api/activities?period=${selectedPeriod}`,
		runOn: [selectedPeriod],
		initialState: [],
		useToken: true,
	});
	return (
		<div tw="flex flex-col justify-center">
			<div tw="p-3 bg-stone-100">
				<LabeledDivider text="Cabin" />
				<CabinNav>
					<ul tw="flex justify-start flex-wrap gap-1">
						{cabins.map((cabinLink, index) => {
							return (
								<Link
									to={`../sign-up/${cabinLink.cabinName}/${weekNumber}`}
									key={`cabin-link-${index}`}
									tw="w-[10%]"
								>
									<MenuSelector
										color="blue"
										isSelected={
											cabinLink.cabinName === cabin
										}
									>
										{cabinLink.cabinName}
									</MenuSelector>
								</Link>
							);
						})}
					</ul>
				</CabinNav>
				<LabeledDivider text="Day" />
				<Days>
					{week.days &&
						week.days.map((day, index) => (
							<MenuSelector
								tw="w-1/5"
								color="blue"
								key={`selectDay-${index}`}
								isSelected={selectedDay === day.dayID}
								onClick={() => {
									setSelectedDay(day.dayID);
									setSelectedPeriod(day.periods[0].id);
								}}
							>
								{day.dayName}
							</MenuSelector>
						))}
				</Days>
				<LabeledDivider text="Period" />
				{selectedDay && (
					<Periods>
						{week.days
							.find((d) => d.dayID === selectedDay)
							.periods.map((period, index) => (
								<MenuSelector
									color="blue"
									tw="flex-grow"
									isSelected={selectedPeriod === period.id}
									onClick={() => {
										setSelectedPeriod(period.id);
									}}
									key={`period-${index}`}
								>
									Activity Period {period.periodNumber}
								</MenuSelector>
							))}
					</Periods>
				)}
			</div>
			{selectedPeriod && (
				<SelectActivities cabinName={cabin} periodID={selectedPeriod} />
			)}
		</div>
	);
};

export default CreateSchedulePage;
