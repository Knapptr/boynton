const pool = require("../db/index");
const Activity = require("./activity");

class Period {
	constructor({ periodNumber, dayID, id }) {
		this.periodNumber = periodNumber;
		this.dayID = dayID;
		this.id = id;
	}
	static async create({ periodNumber, dayID }) {
		const query =
			"INSERT INTO periods (period_number,day_id) VALUES ($1,$2) RETURNING id";
		const values = [periodNumber, dayID];
		const result = await pool.query(query, values);
		const id = result.rows[0].id;
		return new Period({
			periodNumber,
			dayID,
			id,
		});
	}
	static _parseResponse(dbResponse) {
		return {
			periodNumber: dbResponse.period_number,
			dayID: dbResponse.day_id,
			id: dbResponse.id,
		};
	}
	static async get(id) {
		const query = "SELECT * from periods WHERE id = $1";
		const values = [id];
		const results = await pool.query(query, values);
		const { periodNumber, dayID } = Period._parseResponse(results.rows[0]);
		return new Period({ periodNumber, dayID, id });
	}
	async getActivities() {
		const query = "SELECT * from activities WHERE period_id = $1";
		const values = [this.id];
		const results = await pool.query(query, values);
		const activities = results.rows.map(
			(act) => new Activity(Activity._parseResponse(act))
		);
		return activities;
	}
	async addActivity({ name, description }) {
		const activity = await Activity.create({
			name,
			description,
			periodID: this.id,
		});
		return activity;
	}
}
module.exports = Period;

//test
(async () => {
	// 	const period = await Period.create({ periodNumber: 1, dayID: 1 });
	// 	console.log(period);
	const period = await Period.get(346);
	// console.log(period);
	const activities = await period.getActivities();
	console.log(activities);
	// const activity = await period.addActivity({
	// 	name: "Tenniball",
	// 	description: "Baseball, but with a tennis ball and racket",
	// });
	// console.log(activity);
})();
