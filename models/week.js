const pool = require("../db/index");
const { scheduleDays, weeks } = require("../config.json");
class Week {
	constructor({ title, number }) {
		this.title = title;
		this.number = number;
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
	static _parseResults(dbResponse) {
		return {
			title: dbResponse.title,
			number: dbResponse.number,
		};
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
