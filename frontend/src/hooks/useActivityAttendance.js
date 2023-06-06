import { useState, useEffect, useContext, useCallback } from "react";
import fetchWithToken from "../fetchWithToken";
import UserContext from '../components/UserContext';

const useActivityAttendance = (period, cabin) => {
	const [lists, setLists] = useState({});
	const [loading, setLoading] = useState(true);
	const auth = useContext(UserContext);

	const update = (
		sourceId,
		destinationId,
		newSourceList,
		newDestinationList
	) => {
		setLists({
			...lists,
			[sourceId]: { ...lists[sourceId], campers: newSourceList },
			[destinationId]: {
				...lists[destinationId],
				campers: newDestinationList,
			},
		});
	};
	const getCampers = useCallback(async (periodID, cabinName) => {
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
	},

		[auth])
	const initialLoad = useCallback(() => {
		setLoading(true);
		getCampers(period, cabin);
		setLoading(false);
	}, [period, cabin, getCampers])

	const refresh = () => {
		getCampers(period, cabin)
	}
	useEffect(() => {
		initialLoad();
	}, [period, cabin, initialLoad]);

	return { activityLists: lists, updateActivityAttendance: update, loading, setLists, refresh };
};

export default useActivityAttendance;
