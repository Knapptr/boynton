import { useState, useEffect } from "react";

const useActivityAttendance = (period, cabin) => {
	const [lists, setLists] = useState({});

	const getCampers = async (periodID, cabinName) => {
		const camperUrl = `/api/periods/${periodID}/campers?cabin=${cabinName}`;
		const activityUrl = `/api/activities?period=${periodID}`;
		const camperResult = await fetch(camperUrl);
		const activityResult = await fetch(activityUrl);
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
			console.log({ camper });
			if (camper.activityID === null) {
				listing.unassigned.campers.push(camper);
			} else {
				listing[camper.activityID].campers.push(camper);
			}
		});
		setLists(listing);
	};

	useEffect(() => {
		getCampers(period, cabin);
	}, [period, cabin]);

	return { activityLists: lists };
};

export default useActivityAttendance;
