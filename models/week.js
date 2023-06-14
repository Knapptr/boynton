const pool = require("../db");
const weekRepository = require("../repositories/week");
const defaultWeekRepository = require("../repositories/week");
const { fetchOne } = require("../utils/pgWrapper");

class Week {
  constructor(
    { title, begins, ends, number, days = [], display },
    weekRepository = defaultWeekRepository
  ) {
    if (!title || !number) {
      throw new Error("Cannot create Week, title,number required");
    }
    this.title = title;
    this.display = display || number - 1; // To handle "Taste of camp"
    this.days = days;
    this.number = number;
    this._weekRepository = weekRepository;
    this.begins = begins;
    this.ends = ends;
  }
  toJSON() {
    return {
      title: this.title,
      number: this.number,
      days: this.days,
      begins: this.begins,
      ends: this.ends,
      display: this.display,
    };
  }
  async delete() {
    const deletedWeek = await this._weekRepository.delete(this.number);
    if (deletedWeek) {
      return true;
    }
    return false;
  }

  static async getOnDate(date, getStaff = false) {
    const week = await weekRepository.getOnDate(date, getStaff);
    return week;
  }
  static async get(
    weekNumber,
    getStaff = false,
    weekRepository = defaultWeekRepository
  ) {
    const week = await weekRepository.get(weekNumber, getStaff);
    if (!week) {
      return false;
    }
    return new Week(week);
  }
  static async getAll(
    getStaff = false,
    weekRepository = defaultWeekRepository
  ) {
    const weeks = await weekRepository.getAll(getStaff);
    return weeks.map((weekData) => new Week(weekData));
  }
  static async create(
    { title, number, begins, ends },
    weekRepository = defaultWeekRepository
  ) {
    const weekResponse = await weekRepository.create({
      title,
      number,
      begins,
      ends,
    });
    return new Week(weekResponse);
  }
  async clearCabins(area) {
    const query = `
		UPDATE camper_weeks 
		SET cabin_session_id = NULL WHERE week_id = $1
		AND cabin_session_id IN (
		SELECT cs.id
		FROM cabins cab 
		JOIN cabin_sessions cs ON cs.cabin_name = cab.name 
		WHERE cs.week_id= $1 AND cab.area = $2)
		RETURNING * `;
    const values = [this.number, area];
    const result = await pool.query(query, values);
    return result.rows;
  }
}
module.exports = Week;
