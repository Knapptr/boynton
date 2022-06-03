import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "./styled";
const DayNav = ({
	days,
	selectedDay,
	selectedPeriod,
	selectPeriod,
	selectDay,
}) => {
	return (
		<ul tw="my-1 flex gap-2 justify-center">
			{days &&
				days.map((day, index) => (
					<MenuSelector
						tw="w-1/5"
						color="blue"
						key={`selectDay-${index}`}
						isSelected={days[selectedDay].dayID === day.dayID}
						onClick={() => {
							selectDay(index);
							const periodsToSelectFrom = days[index].periods;
							if (selectedPeriod >= periodsToSelectFrom.length) {
								selectPeriod(periodsToSelectFrom.length - 1);
							}
						}}
					>
						{day.dayName}
					</MenuSelector>
				))}
		</ul>
	);
};

export default DayNav;
