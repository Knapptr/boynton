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
	async getActivities() {
		const query = "SELECT * from activities WHERE period_id = $1";
		const values = [this.id];
		const results = await pool.query(query, values);
		const activities = results.rows.map(
			(act) => new Activity(Activity._parseResponse(act))
		);
		return activities;
	}
}
module.exports = Period;

//test
// (async () => {
// 	const period = await Period.create({ periodNumber: 1, dayID: 1 });
// 	console.log(period);
// })();
