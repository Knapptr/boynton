import { Link, Outlet, useParams } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import { useState } from "react";

const Days = tw.ul` flex`;
const Day = styled.li(({ isSelected }) => [
	tw`m-2 p-2`,
	isSelected && tw`bg-red-200`,
]);
const Periods = tw.ul`flex`;
const Period = styled.li(({ isSelected }) => [
	tw`m-2 p-2`,
	isSelected && tw`bg-green-200`,
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
	//currently sending a request that 500s on mount...fix
	const [activities, setActivities] = useGetDataOnMount({
		url: `/api/activities?period=${selectedPeriod}`,
		runOn: [selectedPeriod],
		initialState: [],
	});
	return (
		<>
			<Days tw="text-blue-50">
				{week.days &&
					week.days.map((day, index) => (
						<Day
							key={`selectDay-${index}`}
							isSelected={selectedDay === day.dayID}
							onClick={() => {
								setSelectedDay(day.dayID);
								setSelectedPeriod(undefined);
							}}
						>
							{day.dayName}
							{day.dayID}
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
			{activities.length > 0 && (
				<Activities>
					{activities.map((a) => (
						<Activity>{a.name}</Activity>
					))}
				</Activities>
			)}
		</>
	);
};

export default CreateSchedulePage;
