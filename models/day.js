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
	static async getAllForWeek(weekNumber) {
		const query = "SELECT * from days WHERE week_id = $1";
		const values = [weekNumber];
		const results = await fetchMany(query, values);
		const days = results
			? results.map((db) => new Day(Day._parseResponse(db)))
			: false;
		return days;
	}
	static async getByWeekAndName(week, name) {
		const query = "SELECT * from days WHERE week_id = $1 AND name = $2";
		const values = [week, name];
		const results = await fetchMany(query, values);
		const day = results ? new Day(Day._parseResponse(results)) : false;
		return day;
	}
	static async get(id) {
		const query = "SELECT * from days WHERE id = $1";
		const values = [id];
		const day = await fetchOne(query, values);
		return day ? new Day(Day._parseResponse(day)) : false;
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
