const pool = require("../db/index");
const mapManyToOne = require("../utils/remap");
const defaultWeekRepository = require("../repositories/week");
const { scheduleDays, weeks } = require("../config.json");
const {
	fetchOneAndCreate,
	fetchManyAndCreate,
	fetchMany,
} = require("../utils/pgWrapper");
const Camper = require("./camper");

class Week {
	constructor({ title, days, number }) {
		this.title = title;
		this.days = days;
		this.number = number;
	}
	static async get(id) {
		const weeksQuery = `
		SELECT title,number,d.name as day_name,d.id as day_id FROM weeks w JOIN days d ON d.week_id = w.number WHERE w.number = $1
		`;
		const values = [id];
		const weeksResponse = await fetchMany(weeksQuery, values);
		const parsedWeeks = weeksResponse.map((r) => Week._parseResults(r));
		const mappedWeeks = mapManyToOne({
			array: parsedWeeks,
			newField: "days",
			identifier: "number",
			fieldsToMap: ["dayName", "dayID"],
			fieldsToRemain: ["title", "number"],
		});

		const periodsQuery = "SELECT day_id,period_number,id FROM periods  ";
		const periodsResponse = await fetchMany(periodsQuery);
		const parsedPeriods = periodsResponse.map((dbr) => {
			return {
				periodNumber: dbr.period_number,
				id: dbr.id,
				dayID: dbr.day_id,
			};
		});

		const periodsByDay = parsedPeriods.reduce((acc, cv) => {
			acc[cv.dayID] = acc[cv.dayID] || [];
			const { dayID, ...periodData } = cv;
			acc[cv.dayID].push(periodData);
			return acc;
		}, {});

		const weeks = mappedWeeks.map((week) => {
			week.days.forEach((day) => {
				day.periods = periodsByDay[day.dayID];
			});
			return new Week(week);
		});

		return weeks[0];
	}
	static async getAll() {
		const weeksQuery = `
		SELECT title,number,d.name as day_name,d.id as day_id FROM weeks w JOIN days d ON d.week_id = w.number 
		`;
		const weeksResponse = await fetchMany(weeksQuery);
		const parsedWeeks = weeksResponse.map((r) => Week._parseResults(r));
		const mappedWeeks = mapManyToOne({
			array: parsedWeeks,
			newField: "days",
			identifier: "number",
			fieldsToMap: ["dayName", "dayID"],
			fieldsToRemain: ["title", "number"],
		});

		const periodsQuery = "SELECT day_id,period_number,id FROM periods ";
		const periodsResponse = await fetchMany(periodsQuery);
		const parsedPeriods = periodsResponse.map((dbr) => {
			return {
				periodNumber: dbr.period_number,
				id: dbr.id,
				dayID: dbr.day_id,
			};
		});

		const periodsByDay = parsedPeriods.reduce((acc, cv) => {
			acc[cv.dayID] = acc[cv.dayID] || [];
			const { dayID, ...periodData } = cv;
			acc[cv.dayID].push(periodData);
			return acc;
		}, {});

		const weeks = mappedWeeks.map((week) => {
			week.days.forEach((day) => {
				day.periods = periodsByDay[day.dayID];
			});
			return new Week(week);
		});

		return weeks;
	}
	static _parseResults(dbr) {
		return {
			title: dbr.title,
			number: dbr.number,
			dayName: dbr.day_name,
			dayID: dbr.day_id,
		};
	}
	//static async DestructivelyInitFromConfig() {
	//	//will clear all weeks,periods and cabin sessions! DO NOT USE THIS IN THE MIDDLE OF A SUMMER
	//	const clearWeeks = "DELETE from weeks;";
	//	await pool.query(clearWeeks);
	//	// create weeks
	//	const weekNumbers = Object.keys(weeks);
	//	const createdWeeks = [];
	//	for (let weekNumber of weekNumbers) {
	//		const week = await Week.create({
	//			title: weeks[weekNumber].title,
	//			number: weekNumber,
	//		});
	//		createdWeeks.push(week);
	//	}
	//	for (let week of createdWeeks) {
	//		await week.createDays();
	//	}
	//}
	// async getCampers(init = false) {
	// 	console.log({ init });
	// 	const query =
	// 		"SELECT * from camper_weeks JOIN campers on camper_id = campers.id WHERE week_id = $1";
	// 	const values = [this.number];
	// 	const campers = await fetchManyAndCreate({
	// 		query,
	// 		values,
	// 		Model: Camper,
	// 	});
	// 	if (init) {
	// 		await Promise.all(campers.map((camper) => camper.init()));
	// 	}
	// 	return campers;
	// }
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
	static async create({ title, number,days=[] },weekRepository = defaultWeekRepository) {
    const weekResponse = await weekRepository.create({title,number,days})
		return new Week(weekResponse);
	}
}
module.exports = Week;

//test
// (async () => {
// 	await Week.DestructivelyInitFromConfig();
// })();
