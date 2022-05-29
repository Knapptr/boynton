import useGetDataOnMount from "../hooks/useGetData";
import { Link, Outlet } from "react-router-dom";

const SelectWeek = () => {
	const [weeks] = useGetDataOnMount({ url: "/api/weeks", initialState: [] });
	return (
		<>
			{weeks.map((week) => (
				<Link to={`${week.number}`}>
					Week {week.number} ({week.title})
				</Link>
			))}
			<Outlet />
		</>
	);
};

export default SelectWeek;
