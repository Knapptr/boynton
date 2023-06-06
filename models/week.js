const pool = require("../db");
const defaultWeekRepository = require("../repositories/week");

class Week {
	constructor({ title, number, days = [] }, weekRepository = defaultWeekRepository) {
		if (!title || !number) { throw new Error("Cannot create Week, title,number required") }
		this.title = title;
		this.days = days;
		this.number = number;
		this._weekRepository = weekRepository
	}
	toJSON() {
		return {
			title: this.title,
			number: this.number,
			days: this.days,
		}
	}
	async delete() {
		const deletedWeek = await this._weekRepository.delete(this.number);
		if (deletedWeek) {
			return true
		}
		return false
	}
	static async get(weekNumber, getStaff = false, weekRepository = defaultWeekRepository) {
		const week = await weekRepository.get(weekNumber, getStaff);
		return new Week(week)

	}
	static async getAll(getStaff = false, weekRepository = defaultWeekRepository) {
		const weeks = await weekRepository.getAll(getStaff);
		return weeks.map(weekData => new Week(weekData));
	}
	static async create({ title, number }, weekRepository = defaultWeekRepository) {
		const weekResponse = await weekRepository.create({ title, number })
		return new Week(weekResponse);
	}
	async clearCabins(area) {
		const query = `UPDATE camper_weeks SET cabin_session_id = NULL WHERE week_id = $1 AND cabin_session_id IN (SELECT cs.id FROM cabins cab JOIN cabin_sessions cs ON cs.week_id = $1 AND cab.area = $2) RETURNING * `
		const values = [this.number, area];
		const result = await pool.query(query, values);
		return result.rows;
	}
}
module.exports = Week;

