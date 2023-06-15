import { useState, useEffect, useContext, useCallback } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from '../components/UserContext';

const getAllSessionsForWeek = async (week, area, auth) => {
	const data = await fetchWithToken(
		`/api/cabin-sessions?week=${week}&area=${area}`/*`/api/week/${week}/cabin-sessions?area=${area}`*/, {}, auth
	);
	const cabinSessions = await data.json();
	return cabinSessions;
};


const useCabinSessions = (weekNumber, area) => {
	const [cabinList, setCabinList] = useState({});
	const [cabinSessions, setCabinSessions] = useState([]);
	const auth = useContext(UserContext);

	const updateCabinList = (cabinName, list, secondaryName, secondaryList) => {
		list.sort((camper1, camper2) => camper1.age - camper2.age);
		const update = { ...cabinList, [cabinName]: list };
		if (secondaryName && secondaryList) {
			update[secondaryName] = secondaryList;
		}
		setCabinList(update);
	};

	const getData = useCallback(async () => {
		const cabinSessions = await getAllSessionsForWeek(weekNumber, area, auth);
		// const cabinNames = Object.keys(cabinsState);

		return cabinSessions
	}, [weekNumber, area, auth])

	const refresh = async () => {
		const setState = async (auth) => {
			let cabinSessions = await getData();
			setCabinSessions(cabinSessions);
		};
		setState(auth);
	}


	useEffect(() => {
		const setState = async (auth) => {
			let cabinSessions = await getData();
			setCabinSessions(cabinSessions);
		};
		setState(auth);
	}, [auth, area, weekNumber, getData]);

	return { setCabinList, cabinSessions, updateCabinList, refreshCabins: refresh, setCabinSessions };
};

export default useCabinSessions;
