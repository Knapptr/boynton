const pool = require("../db/index");
const Camper = require("./camper");

class Activity {
	constructor({ name, description, id, periodID }) {
		this.name = name;
		this.id = id;
		this.description = description || "none";
		this.periodID = periodID;
	}
	static _parseResponse(dbResponse) {
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
		const results = await pool.query(query, values);
		const activities = results.rows.map(
			(db) => new Activity(Activity._parseResponse(db))
		);
	}
	static async get(id) {
		const query = "SELECT * from activities WHERE id = $1";
		const values = [id];
		const results = await pool.query(query, values);
		const activity = results.rows[0];
		return new Activity({
			name: activity.name,
			description: activity.description,
			id: activity.id,
			periodID: activity.period_id,
		});
	}
	static async create({ name, description, periodID }) {
		const query =
			"INSERT INTO activities (name,description,period_id) VALUES ($1,$2,$3) RETURNING id, name, description";
		const values = [name, description, periodID];
		const result = await pool.query(query, values);
		const id = result.rows[0].id;
		return new Activity({ name, description, id, periodID });
	}
	async addCamper(camperID) {
		const query =
			"INSERT INTO camper_activities (camper_id,activity_id) VALUES ($1,$2) RETURNING id";
		const values = [camperID, this.id];
		const result = await pool.query(query, values);
		const camperActivityID = result.rows[0].id;
		return camperActivityID;
	}

	async removeCamper(camperID) {
		const query =
			"DELETE from camper_activities WHERE activity_id = $1 AND camper_id = $2 RETURNING camper_id";
		const values = [this.id, camperID];
		const result = await pool.query(query, values);
		return result.rows[0];
	}
	async getCampers() {
		const query =
			"SELECT * FROM camper_activities JOIN campers ON  campers.id = camper_id WHERE activity_id = $1";
		const values = [this.id];
		const results = await pool.query(query, values);
		const campers = results.rows;
		return results.rows.map(
			(camper) =>
				new Camper({
					firstName: camper.first_name,
					lastName: camper.last_name,
					id: camper.id,
					gender: camper.gender,
					age: camper.age,
					sessions: camper.sessions,
				})
		);
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
