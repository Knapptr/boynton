import { useState, useEffect, useContext } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from '../components/UserContext';

const getAllSessionsForWeek = async (week, area, auth) => {
	const data = await fetchWithToken(
		`/api/cabin-sessions?week=${week}&area=${area}`, {}, auth
	);
	const cabinSessions = await data.json();
	return cabinSessions;
};

const getCampersForCabin = async (cabinSessionID, auth) => {
	const data = await fetchWithToken(
		`/api/cabin-sessions/${cabinSessionID}/campers`, {}, auth
	);
	const campers = await data.json();
	return campers || [];
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

	const getData = async () => {
		const cabinsState = {};
		const cabinSessions = await getAllSessionsForWeek(weekNumber, area, auth);
		for (let session of cabinSessions) {
			const campers = await getCampersForCabin(session.id, auth);
			cabinsState[session.cabinName] = campers;
		}
		const cabinNames = Object.keys(cabinsState);

		return { cabinsState, cabinSessions }
	}

	const refresh = async () => {
		const setState = async (auth) => {
			let { cabinsState, cabinSessions } = await getData();
			setCabinList(cabinsState);
			setCabinSessions(cabinSessions);
		};
		setState(auth);
	}


	useEffect(() => {
		const setState = async (auth) => {
			let { cabinsState, cabinSessions } = await getData();
			setCabinList(cabinsState);
			setCabinSessions(cabinSessions);
		};
		setState(auth);
	}, [auth, area, weekNumber]);

	return { setCabinList, cabinList, cabinSessions, updateCabinList, refreshCabins: refresh };
};

export default useCabinSessions;
