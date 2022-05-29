const pool = require("../db/index");
const mapManyToOne = require("../utils/remap");
const error = require("../utils/jsonError");
const Camper = require("./camper");
const Activity = require("./activity");
const {
	fetchOneAndCreate,
	fetchManyAndCreate,
	fetchMany,
} = require("../utils/pgWrapper");

class Period {
	constructor({ periodNumber, dayID, id, activities }) {
		this.periodNumber = periodNumber;
		this.dayID = dayID;
		this.activities = activities || [];
		this.id = id;
	}
	static _parseResults(dbResponse) {
		const period = {
			periodNumber: dbResponse.period_number,
			dayID: dbResponse.day_id,
			id: dbResponse.id,
			activityName: dbResponse.name,
			activityDescription: dbResponse.description,
			activityID: dbResponse.activity_id,
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
		const query = `
SELECT 
day_id,period_number,p.id, 
a.name,a.description,a.id as activity_id
FROM periods p 
LEFT JOIN activities a ON a.period_id = p.id
		`;
		const results = await fetchMany(query);
		const parsedResults = results.map((result) =>
			Period._parseResults(result)
		);
		const periods = mapManyToOne({
			array: parsedResults,
			identifier: "id",
			newField: "activities",
			fieldsToRemain: ["dayID", "number", "id"],
			fieldsToMap: ["activityName", "activityDescription", "activityID"],
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
