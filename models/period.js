const pool = require("../db/index");
const error = require("../utils/jsonError");
const Camper = require("./camper");
const Activity = require("./activity");
const { fetchOneAndCreate, fetchManyAndCreate } = require("../utils/pgWrapper");

class Period {
	constructor({ periodNumber, dayID, id }) {
		this.periodNumber = periodNumber;
		this.dayID = dayID;
		this.id = id;
	}
	static _parseResults(dbResponse) {
		const period = {
			periodNumber: dbResponse.period_number,
			dayID: dbResponse.day_id,
			id: dbResponse.id,
		};
		return period;
	}
	static async create({ periodNumber, dayID }) {
		const query =
			"INSERT INTO periods (period_number,day_id) VALUES ($1,$2) RETURNING id";
		const values = [periodNumber, dayID];
		const period = await fetchOneAndCreate({
			query,
			values,
			Model: Period,
		});
		return period;
	}
	static async getAll() {
		const query = "SELECT * from periods";
		const periods = await fetchManyAndCreate({
			query,
			Model: Period,
		});
		return periods;
	}
	static async get(id) {
		const query = "SELECT * from periods WHERE id = $1";
		const values = [id];
		const period = await fetchOneAndCreate({
			query,
			values,
			Model: Period,
		});
		return period;
	}
	async getActivities() {
		const query = "SELECT * from activities WHERE period_id = $1";
		const values = [this.id];
		const activities = await fetchManyAndCreate({
			query,
			values,
			Model: Activity,
		});
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
// (async () => {
// 	// 	const period = await Period.create({ periodNumber: 1, dayID: 1 });
// 	// 	console.log(period);
// 	const period = await Period.get(346);
// 	// console.log(period);
// 	const activities = await period.getActivities();
// 	console.log(activities);
// 	// const activity = await period.addActivity({
// 	// 	name: "Tenniball",
// 	// 	description: "Baseball, but with a tennis ball and racket",
// 	// });
// 	// console.log(activity);
// })();
