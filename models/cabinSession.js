const { fetchManyAndCreate, fetchOneAndCreate, fetchMany } = require("../utils/pgWrapper");
const pool = require("../db");
const CamperWeek = require("./camperWeek");
const sortCabins = require('../utils/sortCabins');


module.exports = class CabinSession {
	constructor({ weekNumber, weekTitle, cabinName, capacity, area, id, campers, camperId }) {
		this.weekNumber = weekNumber;
		this.id = id;
		this.weekName = weekTitle;
		this.name = cabinName;
		this.capacity = capacity;
		this.area = area;
		this.campers = campers;
		this.camperId = camperId
	}
	static _parseResults({ week_number, cabin_name, capacity, week_title, area, id, camper_id }) {
		return {
			weekNumber: week_number,
			id: id,
			name: cabin_name,
			capacity: capacity,
			weekTitle: week_title,
			cabinArea: area,
			camperId: camper_id
		};
	}
	static async get(cabinSessionID) {
		const query = `
			SELECT 
			cabin_sessions.id,
			week_id,
			cabin_name,
			cabins.capacity,
			weeks.title,
			cabins.area 
			FROM cabin_sessions JOIN cabins ON cabins.name = cabin_sessions.cabin_name JOIN weeks ON cabin_sessions.week_id = weeks.number WHERE cabin_sessions.id=$1
		`;
		const values = [cabinSessionID];
		const cabin = await fetchOneAndCreate({
			query,
			values,
			Model: CabinSession,
		});
		return cabin;
	}
	static async getForWeek(weekNumber) {
		const query = `
			SELECT 
			weeks.number as week_number, 
			cs.id as id,
			weeks.title as week_title,
			cab.name as cabin_name,
			cab.capacity as capacity,
			cab.area as area,
			camp.first_name as camper_first,
			camp.last_name as camper_last,
			camp.pronouns as camper_pronouns,
			camp.age as camper_age,
			camp.id as camper_id,
			cw.day_camp as camper_day_camp,
			cw.fl as camper_fl,
			cw.id as camper_session_id
			FROM cabin_sessions cs
			JOIN cabins cab ON cab.name = cs.cabin_name
			LEFT JOIN camper_weeks cw ON cw.cabin_session_id = cs.id
			left JOIN campers camp ON camp.id = cw.camper_id
			JOIN weeks ON cs.week_id = weeks.number
			WHERE weeks.number = $1
			ORDER BY cs.id, camp.age, camp.last_name
		`
		const values = [weekNumber]
			;
		const response = await fetchMany(query, values);
		const cabins = CabinSession.deserialize(response);

		// cabins.sort(sortCabins)
		// console.log({ sortedCabins: cabins })
		return cabins;

	}
	static async getAll() {
		const query = `
			SELECT 
			weeks.number as week_number, 
			cs.id as id,
			weeks.title as week_title,
			cab.name as cabin_name,
			cab.capacity as capacity,
			cab.area as area,
			camp.first_name as camper_first,
			camp.last_name as camper_last,
			camp.pronouns as camper_pronouns,
			camp.age as camper_age,
			camp.id as camper_id,
			cw.day_camp as camper_day_camp,
			cw.fl as camper_fl,
			cw.id as camper_session_id
			FROM cabin_sessions cs
			JOIN cabins cab ON cab.name = cs.cabin_name
			LEFT JOIN camper_weeks cw ON cw.cabin_session_id = cs.id
			left JOIN campers camp ON camp.id = cw.camper_id
			JOIN weeks ON cs.week_id = weeks.number
			ORDER BY cs.id, camp.age, camp.last_name
		`
			;
		const response = await fetchMany(query)
		const cabins = CabinSession.deserialize(response);

		// cabins.sort(sortCabins)
		// console.log({ sortedCabins: cabins })
		return cabins;
	}

	/** Turn a list of cabin sessions with potential null campers to a list of cabins each with a (possibly empty) list of campers 
	* @params {any[]} dbResponse the response from the database. See the getAll Query
	*/
	static deserialize(dbResponse) {
		// allocate array for results
		const results = [];
		for (const response of dbResponse) {
			const currentCabin = results.at(-1) && results.at(-1).id === response.id ? results.pop() : {
				id: response.id,
				weekNumber: response.week_number,
				weekTitle: response.week_title,
				cabinName: response.cabin_name,
				capacity: response.capacity,
				area: response.area,
				campers: []
			};
			if (response.camper_session_id !== null) {
				const camper = {
					firstName: response.camper_first,
					lastName: response.camper_last,
					age: response.camper_age,
					pronouns: response.camper_pronouns,
					dayCamp: response.camper_day_camp,
					fl: response.camper_fl,
					id: response.camper_session_id,
					camperId: response.camper_id
				};
				currentCabin.campers.push(camper);
			}
			results.push(currentCabin);
		}
		const deserResults = results.map(c => new CabinSession(c));
		// console.log({ deserResults });
		return deserResults;
	}

	async getCampers() {
		const query = `SELECT age, cabins.name, first_name,last_name,weeks.title,camper_id,camper_weeks.week_id,camper_weeks.id,camper_weeks.cabin_session_id, camper_weeks.day_camp ,camper_weeks.fl
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
		return camperSessions;
	}
	async addCampers(campers) {
		const client = await pool.connect();
		try {
			await client.query("BEGIN")
			const queries = campers.map(camperSession => {
				const query = `UPDATE camper_weeks SET cabin_session_id = $1 WHERE camper_weeks.id = $2 RETURNING *`
				const values = [this.id, camperSession.id];
				return client.query(query, values);
			})
			const results = await Promise.all(queries);
			const camperSessions = results.map(r => ({
				cabinSessionId: r.rows[0].cabin_session_id,
				id: r.rows[0].id,
				camperId: r.rows[0].camper_id,
				dayCamp: r.rows[0].day_camp,
				fl: r.rows[0].fl,
				weekNumber: r.rows[0].week_id
			}))
			await client.query("COMMIT");
			return camperSessions;


		} catch (e) {
			await client.query("ROLLBACK")
			throw e
		}
		finally {
			client.release()
		}
	}
};
