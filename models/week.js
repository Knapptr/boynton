const pool = require("../db/index");
const { scheduleDays, weeks } = require("../config.json");
const { fetchOneAndCreate, fetchManyAndCreate } = require("../utils/pgWrapper");

const Camper = require("./camper");
class Week {
	constructor({ title, number }) {
		this.title = title;
		this.number = number;
	}
	static _parseResults(dbResponse) {
		return {
			title: dbResponse.title,
			number: dbResponse.number,
		};
	}
	static async DestructivelyInitFromConfig() {
		//will clear all weeks,periods and cabin sessions! DO NOT USE THIS IN THE MIDDLE OF A SUMMER
		const clearWeeks = "DELETE from weeks;";
		await pool.query(clearWeeks);
		// create weeks
		const weekNumbers = Object.keys(weeks);
		const createdWeeks = [];
		for (let weekNumber of weekNumbers) {
			const week = await Week.create({
				title: weeks[weekNumber].title,
				number: weekNumber,
			});
			createdWeeks.push(week);
		}
		for (let week of createdWeeks) {
			await week.createDays();
		}
	}
	static async get(id) {
		const query = "SELECT * from weeks WHERE number = $1";
		const values = [id];
		const week = await fetchOneAndCreate({ query, values, Model: Week });
		return week;
	}
	static async getAll() {
		const query = "SELECT * from weeks";
		const weeks = await fetchManyAndCreate({ query, Model: Week });
		return weeks;
	}
	async getCampers() {
		const query =
			"SELECT * from camper_weeks JOIN campers on camper_id = campers.id WHERE week_id = $1";
		const values = [this.number];
		const campers = await fetchManyAndCreate({
			query,
			values,
			Model: Camper,
		});
		return campers;
	}
	async createDays() {
		// create days and periods for each day
		for (let day of scheduleDays) {
			const dayQuery =
				"INSERT INTO days (name,week_id) VALUES ($1,$2) RETURNING id ";
			const dayValues = [day.day, this.number];
			const dayResult = await pool.query(dayQuery, dayValues);
			const dayID = dayResult.rows[0].id;

			for (let i = 1; i <= day.periods; i++) {
				const periodQuery =
					"INSERT INTO periods (day_id,period_number) VALUES ($1,$2)";
				const periodValues = [dayID, i];
				await pool.query(periodQuery, periodValues);
			}
		}
	}
	static async create({ title, number }) {
		const query =
			"INSERT INTO weeks (title,number) VALUES ($1,$2) RETURNING *";
		const values = [title, number];
		const results = await pool.query(query, values);
		const week = results.rows[0];
		return new Week(Week._parseResults(week));
	}
}
module.exports = Week;

//test
// (async () => {
// 	await Week.DestructivelyInitFromConfig();
// })();
