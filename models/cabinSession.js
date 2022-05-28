const { fetchManyAndCreate, fetchOneAndCreate } = require("../utils/pgWrapper");
const CamperWeek = require("./camperWeek");

module.exports = class CabinSession {
	constructor({ weekNumber, weekName, cabinName, capacity, cabinArea, id }) {
		this.weekNumber = weekNumber;
		this.id = id;
		this.weekName = weekName;
		this.cabinName = cabinName;
		this.capacity = capacity;
		this.cabinArea = cabinArea;
	}
	static _parseResults({ week_id, cabin_name, capacity, title, area, id }) {
		return {
			weekNumber: week_id,
			id: id,
			cabinName: cabin_name,
			capacity: capacity,
			weekTitle: title,
			cabinArea: area,
		};
	}
	static async get(cabinSessionID) {
		const query =
			"SELECT cabin_sessions.id,week_id,cabin_name,cabins.capacity,weeks.title,cabins.area FROM cabin_sessions JOIN cabins ON cabins.name = cabin_sessions.cabin_name JOIN weeks ON cabin_sessions.week_id = weeks.number WHERE cabin_sessions.id=$1";
		const values = [cabinSessionID];
		const cabin = await fetchOneAndCreate({
			query,
			values,
			Model: CabinSession,
		});
		return cabin;
	}
	static async getAll() {
		const query =
			"SELECT cabin_sessions.id,week_id,cabin_name,cabins.capacity,weeks.title,cabins.area FROM cabin_sessions JOIN cabins ON cabins.name = cabin_sessions.cabin_name JOIN weeks ON cabin_sessions.week_id = weeks.number";
		const cabins = await fetchManyAndCreate({
			query,
			Model: CabinSession,
		});
		return cabins;
	}
	async getCampers() {
		const query = `SELECT age, cabins.name,first_name,last_name,weeks.title,camper_id,camper_weeks.week_id,camper_weeks.id,camper_weeks.cabin_session_id 
		FROM  camper_weeks 
		JOIN weeks ON weeks.number = camper_weeks.week_id 
		JOIN campers ON campers.id = camper_weeks.camper_id 
		JOIN cabin_sessions ON cabin_sessions.id = camper_weeks.cabin_session_id
		JOIN cabins ON cabin_sessions.cabin_name = cabins.name
		WHERE cabin_sessions.id = $1
`;
		const values = [this.id];
		const camperSessions = await fetchManyAndCreate({
			query,
			values,
			Model: CamperWeek,
		});
		console.log({ camperSessions });
		return camperSessions;
	}
};
