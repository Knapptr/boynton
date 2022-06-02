const mapManyToOne = require("../utils/remap");
const {
	fetchOneAndCreate,
	fetchOne,
	fetchMany,
} = require("../utils/pgWrapper");
const Camper = require("./camper");

class Activity {
	constructor({ name, description, campers, id, periodID }) {
		this.name = name;
		this.id = id;
		this.description = description || "none";
		this.periodID = periodID;
		this.campers = campers;
	}
	static _parseResults(dbr) {
		return {
			sessionID: dbr.camper_session_id,
			camperID: dbr.camper_id,
			firstName: dbr.first_name,
			lastName: dbr.last_name,
			name: dbr.name,
			id: dbr.id,
			periodID: dbr.period_id,
			description: dbr.description,
		};
	}
	static async getAll() {
		const query = `
SELECT
act.name AS name,
act.id,
act.period_id,
act.description,
cw.id AS camper_session_id,
cw.camper_id AS camper_id,
c.first_name,
c.last_name
FROM activities act
LEFT JOIN camper_activities ca ON ca.activity_id = act.id
LEFT JOIN camper_weeks cw ON cw.id = ca.camper_week_id
LEFT JOIN campers c ON cw.camper_id = c.id

		`;
		const results = await fetchMany(query);
		const parsedResults = results.map((result) =>
			Activity._parseResults(result)
		);
		const mappedResults = mapManyToOne({
			array: parsedResults,
			identifier: "id",
			newField: "campers",
			fieldsToMap: ["sessionID", "camperID", "firstName", "lastName"],
			fieldsToRemain: ["name", "id", "periodID", "description"],
		});
		const activities = mappedResults.map((act) => new Activity(act));

		return activities;
	}
	static async get(id) {
		const query = `
SELECT
act.name AS name,
act.id,
act.period_id,
act.description,
cw.id AS camper_session_id,
cw.camper_id AS camper_id,
c.first_name,
c.last_name
FROM activities act
LEFT JOIN camper_activities ca ON ca.activity_id = act.id
LEFT JOIN camper_weeks cw ON cw.id = ca.camper_week_id
LEFT JOIN campers c ON cw.camper_id = c.id
WHERE act.id = $1 `;
		const values = [id];
		const results = await fetchMany(query, values);
		const parsedResults = results.map((result) =>
			Activity._parseResults(result)
		);
		const mappedResults = mapManyToOne({
			array: parsedResults,
			identifier: "id",
			newField: "campers",
			fieldsToMap: ["sessionID", "camperID", "firstName", "lastName"],
			fieldsToRemain: ["name", "id", "periodID", "description"],
		});
		const activities = mappedResults.map((act) => new Activity(act));

		return activities[0];
	}
	static async create({ name, description, periodID }) {
		const query =
			"INSERT INTO activities (name,description,period_id) VALUES ($1,$2,$3) RETURNING id, name, description period_id";
		const values = [name, description, periodID];
		const activity = await fetchOneAndCreate({
			query,
			values,
			Model: Activity,
		});
		return activity;
	}
	async addCamper(camperID, periodID) {
		const query =
			"INSERT INTO camper_activities (camper_week_id,activity_id,period_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT one_activity_per_camper DO UPDATE set activity_id = $2,period_id = $3 RETURNING id, period_id,activity_id";
		const values = [camperID, this.id, periodID];
		const result = await fetchOne(query, values);
		const camperActivityID = result.id;
		return camperActivityID;
	}
}

module.exports = Activity;

//test
(async () => {
	// 	const activity = await Activity.create({
	// 		name: "Yarn Bombing",
	// 		description: "Wrap stuff with yarn!",
	// 		periodID: 2,
	// 	});
	// const activity = await Activity.get(2);
	// console.log(activity);
	// const id = await activity.addCamper(1416);
	// const campers = await activity.getCampers();
	// console.log(campers[0]);
	// const removedCamper = await activity.removeCamper(1416);
	// console.log({ removedCamper });
})();
