const pool = require("../db/index");
const Period = require("./period");
class Day {
	constructor({ name, weekID, id }) {
		if (name.length !== 3) {
			throw new Error("Day name MUST be 3 characters");
		}
		this.name = name;
		this.weekID = weekID;
		this.id = id;
	}

	static async create({ name, weekID }) {
		if (name.length !== 3) {
			throw new Error("Day name MUST be 3 characters");
		}
		const query =
			"INSERT INTO days (name,week_id) VALUES ($1,$2) RETURNING id";
		const values = [name, weekID];
		const result = await pool.query(query, values);
		const id = result.rows[0].id;
		return new Day({ name: name, weekID: weekID, id: id });
	}
	static _parseResponse(dbResponse) {
		return {
			name: dbResponse.name,
			id: dbResponse.id,
			weekID: dbResponse.week_id,
		};
	}
	static async get(id) {
		const query = "SELECT * from days WHERE id = $1";
		const values = [id];
		const result = await pool.query(query, values);
		const day = result.rows[0];
		console.log({ day });
		return new Day(Day._parseResponse(day));
	}
	async getPeriods() {
		const query = "SELECT * from periods WHERE day_id = $1";
		const values = [this.id];
		const results = await pool.query(query, values);
		const periodResponse = results.rows.map((per) => {
			return {
				periodNumber: per.period_number,
				id: per.id,
				dayID: per.day_id,
			};
		});
		const periods = periodResponse.map((per) => new Period(per));
		return periods;
	}
}
module.exports = Day;

//test
// (async () => {
// 	const day = await Day.create({ name: "TUE", weekID: "2" });
// 	console.log(day);
// })();
// (async () => {
// 	const day = await Day.get(1);
// 	console.log(day);
// 	const periods = await day.getPeriods();
// 	console.log(periods);
// 	const activities1 = await periods[0].getActivities();
// 	console.log(activities1);
// })();
