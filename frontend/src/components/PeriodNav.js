import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "./styled";

const PeriodNav = ({ days, selectPeriod, selectedDay, selectedPeriod }) => {
	return (
		<ul tw="gap-2 flex justify-center">
			{days[selectedDay].periods.map((period, index) => (
				<MenuSelector
					color="blue"
					tw="flex-grow"
					isSelected={
						days[selectedDay].periods[selectedPeriod].id ===
						period.id
					}
					onClick={() => {
						selectPeriod(index);
					}}
					key={`period-${index}`}
				>
					Activity Period {period.periodNumber}
				</MenuSelector>
			))}
		</ul>
	);
};
export default PeriodNav;
