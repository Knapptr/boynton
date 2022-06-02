import { useState, useEffect } from "react";
import fetchWithToken from "../fetchWithToken";

const getAllSessionsForWeek = async (week, area) => {
	const data = await fetchWithToken(
		`/api/cabin-sessions?week=${week}&area=${area}`
	);
	const cabinSessions = await data.json();
	return cabinSessions;
};

const getCampersForCabin = async (cabinSessionID) => {
	const data = await fetchWithToken(
		`/api/cabin-sessions/${cabinSessionID}/campers`
	);
	const campers = await data.json();
	return campers || [];
};

const useCabinSessions = (weekNumber, area) => {
	const [cabinList, setCabinList] = useState({});
	const [cabinSessions, setCabinSessions] = useState([]);

	const updateCabinList = (cabinName, list, secondaryName, secondaryList) => {
		list.sort((camper1, camper2) => camper1.age - camper2.age);
		const update = { ...cabinList, [cabinName]: list };
		if (secondaryName && secondaryList) {
			update[secondaryName] = secondaryList;
		}
		setCabinList(update);
	};

	const setState = async () => {
		const cabinsState = {};
		const cabinSessions = await getAllSessionsForWeek(weekNumber, area);
		for (let session of cabinSessions) {
			const campers = await getCampersForCabin(session.id);
			cabinsState[session.cabinName] = campers;
		}
		const cabinNames = Object.keys(cabinsState);
		setCabinList(cabinsState);
		setCabinSessions(cabinSessions);
	};

	useEffect(() => {
		setState();
	}, []);

	return { setCabinList, cabinList, cabinSessions, updateCabinList };
};

export default useCabinSessions;
