import { useState, useEffect } from "react";
import fetchWithToken from "../fetchWithToken";

const useActivityAttendance = (period, cabin) => {
	const [lists, setLists] = useState({});
	const [loading, setLoading] = useState(true);

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

	const getCampers = async (periodID, cabinName) => {
		setLoading(true);
		const camperUrl = `/api/periods/${periodID}/campers?cabin=${cabinName}`;
		const activityUrl = `/api/activities?period=${periodID}`;
		const camperResult = await fetchWithToken(camperUrl);
		const activityResult = await fetchWithToken(activityUrl);
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
			if (camper.activityID === null) {
				listing.unassigned.campers.push(camper);
			} else {
				listing[camper.activityID].campers.push(camper);
			}
		});
		setLists(listing);
		setLoading(false);
	};

	useEffect(() => {
		getCampers(period, cabin);
	}, [period, cabin]);

	return { activityLists: lists, updateActivityAttendance: update, loading };
};

export default useActivityAttendance;
