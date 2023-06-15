import { useState, useEffect, useContext, useCallback } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from '../components/UserContext';

const useActivityAttendance = (period, cabin) => {
	const [lists, setLists] = useState({});
	const [loading, setLoading] = useState(true);
	const auth = useContext(UserContext);

	const getCampers = useCallback(async (periodID, cabinName, withLoading) => {
		if (withLoading) { setLoading(true) }
		const camperUrl = `/api/periods/${periodID}/campers?cabin=${cabinName}`;
		const activityUrl = `/api/activity-sessions?period=${periodID}`;
		const camperResult = await fetchWithToken(camperUrl, {}, auth);
		const activityResult = await fetchWithToken(activityUrl, {}, auth);
		const activities = await activityResult.json();
		const campers = await camperResult.json();

		const listing = { activityIds: [], unassigned: { campers: [] } };
		activities.forEach((act) => {
			listing.activityIds.push(act.id);
			listing[act.id] = {
				name: act.name,
				description: act.description,
				campers: [],
			};
		});
		campers.forEach((camper) => {
			if (camper.activityId === 'Unassigned') {
				listing.unassigned.campers.push(camper);
			} else {
				listing[camper.activityId].campers.push(camper);
			}
		});
		setLists(listing);
		if (withLoading) { setLoading(false) }
	},

		[auth])
	const getData = useCallback(async () => {
		getCampers(period, cabin, true)
	}, [period, cabin,getCampers])

	const refresh = () => {
		getCampers(period, cabin, false);
	}
	useEffect(() => {
		getData();
	}, [period, cabin, getData]);

	return { activityLists: lists, loading, setLists, refresh };
};

export default useActivityAttendance;
