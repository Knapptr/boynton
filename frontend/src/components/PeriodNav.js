import { MenuSelector } from "./styled";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const PeriodNav = ({ days, selectPeriod, selectedDay, selectedPeriod }) => {
	return (
		<ToggleButtonGroup exclusive value={selectedPeriod} onChange={(e,value)=>{selectPeriod(value)}}>
			{days[selectedDay].periods.map((period, index) => (
				<ToggleButton
					key={`period-${index}`}
					onClick={() => {
						selectPeriod(index);
					}}
				value={index}
				>
					Act {period.number}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
};
export default PeriodNav;
