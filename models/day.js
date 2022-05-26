const pool = require("../db/index");
const Period = require("./period");
const {
	fetchMany,
	fetchOne,
	fetchManyAndCreate,
	fetchOneAndCreate,
} = require("../utils/pgWrapper");
class Day {
	constructor({ name, weekNumber, id }) {
		if (name.length !== 3) {
			throw new Error("Day name MUST be 3 characters");
		}
		this.name = name;
		this.weekNumber = weekNumber;
		this.id = id;
	}

	static async create({ name, weekID }) {
		if (name.length !== 3) {
			throw new Error("Day name MUST be 3 characters");
		}
		const query =
			"INSERT INTO days (name,week_id) VALUES ($1,$2) RETURNING *";
		const values = [name, weekID];
		const day = fetchOneAndCreate({ query, values, Model: Day });
		return day;
	}
	static _parseResults(dbResponse) {
		return {
			name: dbResponse.name,
			id: dbResponse.id,
			weekNumber: dbResponse.week_id,
		};
	}
	static async get(id) {
		const query = "SELECT * from days WHERE id = $1";
		const values = [id];
		const day = await fetchOneAndCreate({ query, values, Model: Day });
		return day;
	}
	static async getAll() {
		const query = "SELECT * from days";
		const days = await fetchManyAndCreate({ query, Model: Day });
		return days;
	}
}
module.exports = Day;
