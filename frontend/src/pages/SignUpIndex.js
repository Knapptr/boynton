import { useState, useEffect} from "react";
import { Outlet,useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import "styled-components/macro";
// import cl from "../cl.png";

const SignUpIndex = () => {
	// const location = useLocation();
	const navigate = useNavigate();
	const [cabins] = useGetDataOnMount({
		url: "/api/cabins",
		initialState: [],
		optionalSortFunction: (c1, c2) => {
			if ((c1.area = "GA")) {
				return 1;
			} else {
				return -1;
			}
		},
		useToken: true,
	});
	const [weeks] = useGetDataOnMount({
		url: "/api/weeks",
		initialState: [],
		useToken: true,
	});
	const [selected, setSelected] = useState({
		cabin: undefined,
		week: undefined,
	});
	const select = (name, value) => {
		setSelected((s) => ({ ...s, [name]: value }));
	};
	useEffect(() => {
		if (selected.cabin && selected.week) {

			// setShowAccordion(false);
			navigate(`/schedule/sign-up/${selected.cabin}/${selected.week}`)
		}
	}, [navigate,selected.cabin, selected.week])
	return (
		<>
			{!(weeks.length > 0 && cabins.length > 0) ? (
				<>
					<p>loading...</p>
				</>
			) : (
				<></>)}
			<Outlet />
		</>
	);
};

export default SignUpIndex;
