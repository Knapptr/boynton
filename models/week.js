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
	constructor({ title, number,days=[] },weekRepository = defaultWeekRepository) {
    if(!title || !number){ throw new Error("Cannot create Week, title,number required")}
		this.title = title;
		this.days = days;
		this.number = number;
    this._weekRepository = weekRepository
	}
  toJSON(){
    return {
      title: this.title,
      number: this.number,
      days: this.days,
    }
  }
	static async get(weekNumber,weekRepository=defaultWeekRepository) {
    const week = await weekRepository.get(weekNumber)
    return new Week(week)
    
	}
	static async getAll(weekRepository = defaultWeekRepository) {
    const weeks = await weekRepository.getAll();
    return weeks.map(weekData=> new Week(weekData));
	}
	static async create({ title, number,days=[] },weekRepository = defaultWeekRepository) {
    const weekResponse = await weekRepository.create({title,number,days})
		return new Week(weekResponse);
	}
}
module.exports = Week;

// removed methods
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
	// async createDays() {
	// 	// create days and periods for each day
	// 	for (let day of scheduleDays) {
	// 		const dayQuery =
	// 			"INSERT INTO days (name,week_id) VALUES ($1,$2) RETURNING id ";
	// 		const dayValues = [day.day, this.number];
	// 		const dayResult = await pool.query(dayQuery, dayValues);
	// 		const dayID = dayResult.rows[0].id;

	// 		for (let i = 1; i <= day.periods; i++) {
	// 			const periodQuery =
	// 				"INSERT INTO periods (day_id,period_number) VALUES ($1,$2)";
	// 			const periodValues = [dayID, i];
	// 			await pool.query(periodQuery, periodValues);
	// 		}
	// 	}
	// }
