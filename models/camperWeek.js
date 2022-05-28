const pool = require("../db");
const {
	fetchOneAndCreate,
	fetchManyAndCreate,
	fetchOne,
} = require("../utils/pgWrapper");
const Cabin = require("./cabin");
class CamperWeek {
	constructor({
		firstName,
		gender,
		lastName,
		weekNumber,
		weekTitle,
		camperID,
		id,
		cabinSessionID,
		cabinName,
		age,
	}) {
		this.weekNumber = weekNumber;
		this.gender = gender;
		this.age = age;
		this.firstName = firstName;
		this.lastName = lastName;
		this.weekTitle = weekTitle;
		this.camperID = camperID;
		this.id = id;
		this.cabinSessionID = cabinSessionID;
		this.cabinName = cabinName || "unassigned";
	}
	static _parseResults({
		first_name,
		gender,
		age,
		last_name,
		week_id,
		camper_id,
		id,
		title,
		cabin_session_id,
	}) {
		return {
			weekNumber: week_id,
			gender: gender,
			firstName: first_name,
			age: age,
			lastName: last_name,
			camperID: camper_id,
			weekTitle: title,
			cabinSessionID: cabin_session_id,
			id,
		};
	}
	static async getAll() {
		const query =
			"SELECT first_name,last_name,age,gender, weeks.title,camper_id,week_id,camper_weeks.id, camper_weeks.cabin_session_id FROM camper_weeks JOIN weeks ON weeks.number = camper_weeks.week_id JOIN campers ON campers.id = camper_weeks.camper_id";
		const camperWeek = await fetchManyAndCreate({
			query,
			Model: CamperWeek,
		});
		return camperWeek;
	}
	static async getOne(id) {
		const query =
			"SELECT first_name,last_name,age,gender,weeks.title,camper_id,week_id,camper_weeks.id, camper_weeks.cabin_session_id FROM camper_weeks JOIN weeks ON weeks.number = camper_weeks.week_id JOIN campers ON campers.id = camper_weeks.camper_id WHERE camper_weeks.id = $1";
		const values = [id];
		const camperWeek = await fetchOneAndCreate({
			query,
			values,
			Model: CamperWeek,
		});
		return camperWeek;
	}
	static async getAllCamper(camperID, init = false) {
		const query =
			"SELECT weeks.title,camper_id,week_id,camper_weeks.id, cabin_session_id FROM camper_weeks JOIN weeks ON weeks.number=camper_weeks.week_id WHERE camper_id = $1";
		const values = [camperID];
		const camperWeeks = await fetchManyAndCreate({
			query,
			values,
			Model: CamperWeek,
		});
		if (init) {
			await Promise.all(
				camperWeeks.map((camperWeek) => camperWeek.init())
			);
		}
		return camperWeeks || [];
	}
	async init() {
		const cabinSessionID = this.cabinSessionID;
		if (cabinSessionID) {
			const cabinQuery =
				"SELECT cabins.name,cabins.capacity from cabin_sessions JOIN cabins ON cabins.name = cabin_sessions.cabin_name WHERE cabin_sessions.id = $1";
			const cabinValues = [cabinSessionID];
			const cabin = await fetchOne(cabinQuery, cabinValues);
			this.cabinName = cabin.name;
		}
	}
	async assignCabin(cabinSessionID) {
		const query =
			"UPDATE camper_weeks SET cabin_session_id = $1 WHERE id=$2";
		const values = [cabinSessionID, this.id];
		await pool.query(query, values);
		const cabinQuery =
			"SELECT cabins.name,cabins.capacity from cabin_sessions JOIN cabins ON cabins.name = cabin_sessions.cabin_name WHERE cabin_sessions.id = $1";
		const cabinValues = [cabinSessionID];
		const cabin = await fetchOne(cabinQuery, cabinValues);
		const assignedCabin = {
			name: cabin.name,
			capacity: cabin.capacity,
			session: cabinSessionID,
		};
		this.cabin = assignedCabin;
		return assignedCabin;
	}
}

module.exports = CamperWeek;
