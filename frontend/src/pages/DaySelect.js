import { useParams, Link, Outlet } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";

const DaySelect = () => {
	const { weekNumber } = useParams();
	const [days] = useGetDataOnMount({
		url: `/api/days?week=${weekNumber}`,
		initialState: [],
	});
	return (
		<>
			{days.map((day) => (
				<Link to={`${day.id}`}>{day.name}</Link>
			))}{" "}
			<Outlet />
		</>
	);
};
export default DaySelect;
