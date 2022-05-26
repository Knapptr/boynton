const pool = require("../db/index");
const {
	fetchManyAndCreate,
	fetchOneAndCreate,
	fetchOne,
} = require("../utils/pgWrapper");
const Camper = require("./camper");

class Activity {
	constructor({ name, description, id, periodID }) {
		this.name = name;
		this.id = id;
		this.description = description || "none";
		this.periodID = periodID;
	}
	static _parseResults(dbResponse) {
		return {
			name: dbResponse.name,
			id: dbResponse.id,
			periodID: dbResponse.period_id,
			description: dbResponse.description,
		};
	}
	static async getAllForPeriod(periodID) {
		const query = "SELECT * from activities WHERE period_id = $1";
		const values = [periodID];
		const activities = await fetchManyAndCreate({
			query,
			values,
			Model: Activity,
		});
	}
	static async get(id) {
		const query = "SELECT * from activities WHERE id = $1";
		const values = [id];
		const activity = await fetchOneAndCreate({
			query,
			values,
			Model: Activity,
		});
		return activity;
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
	async addCamper(camperID) {
		const query =
			"INSERT INTO camper_activities (camper_id,activity_id) VALUES ($1,$2) RETURNING id";
		const values = [camperID, this.id];
		const result = await fetchOne(query, values);
		const camperActivityID = result.id;
		return camperActivityID;
	}

	async removeCamper(camperID) {
		const query =
			"DELETE from camper_activities WHERE activity_id = $1 AND camper_id = $2 RETURNING *";
		const values = [this.id, camperID];
		const deletedCamperActivity = await fetchOne(query, values);
		const deletedCamperID = deletedCamperActivity.camper_id;
		const camperQuery = "SELECT * from campers WHERE id = $1";
		const camperValues = [deletedCamperID];
		const deletedCamper = await fetchOneAndCreate({
			query: camperQuery,
			values: camperValues,
			Model: Camper,
		});
		return deletedCamper;
	}
	async getCampers() {
		const query =
			"SELECT * FROM camper_activities JOIN camper_weeks ON camper_weeks.id = camper_activities.camper_week_id JOIN campers ON campers.id = camper_weeks.camper_id WHERE activity_id = $1";
		const values = [this.id];
		const campers = await fetchManyAndCreate({
			query,
			values,
			Model: Camper,
		});
		return campers;
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
