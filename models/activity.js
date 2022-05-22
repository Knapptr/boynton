const pool = require("../db/index");
const Camper = require("./camper");

class Activity {
	constructor({ name, description, id, periodID }) {
		this.name = name;
		this.id = id;
		this.description = description || "none";
		this.periodID = periodID;
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
		return new Activity({ name, description, id });
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
