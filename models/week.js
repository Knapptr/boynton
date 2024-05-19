const pool = require("../db");
const weekRepository = require("../repositories/week");
const defaultWeekRepository = require("../repositories/week");
const DbError = require("../utils/DbError");
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
  async assignStaffToPeriodNumber(periodNumber, staffSessionList) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allReqs = staffSessionList.map(async (s) => {
        const query = `
	  INSERT INTO staff_on_periods (staff_session_id,period_id) 
	  SELECT $1, pe.id FROM periods pe
	  JOIN days d ON d.id = pe.day_id
	  JOIN weeks w ON w.number = d.week_id
	  WHERE w.number = $2 AND pe.period_number = $3
	  RETURNING * `;

        const values = [s.id, this.number, periodNumber];
        const result = await client.query(query, values);
        if (result.rowCount === 0) {
          throw new Error("Could not add staff to period");
        }
        return result.rows.map((r) => {
          const {
            id,
            staff_session_id: staffSessionId,
            period_id: periodId,
          } = r;
          return { id, staffSessionId, periodId };
        });
      });
      const allResults = await Promise.all(allReqs);
      client.query("COMMIT");
      return allResults;
    } catch (e) {
      client.query("ROLLBACK");
      throw DbError.transactionFailure(
        `Could not assign staff to periods: ${e}`
      );
    } finally {
      client.release();
    }
  }

  async unassignStaffToPeriodNumber(periodNumber, staffSessionList) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allReqs = staffSessionList.map(async (s) => {
        const query = `
	  DELETE FROM staff_on_periods op
	  WHERE  op.period_id IN (SELECT 
	   periods.id 
	   FROM periods 
	   JOIN days d ON d.id = periods.day_id
	   WHERE periods.period_number = $3 AND d.week_id = $2)  
	  AND op.staff_session_id = $1
	  RETURNING * `;

        const values = [s.id, this.number, periodNumber];
        const result = await client.query(query, values);
        if (result.rowCount === 0) {
          throw new Error("Could not remove staff from periods");
        }
        return result.rows.map((r) => {
          const {
            id,
            staff_session_id: staffSessionId,
            period_id: periodId,
          } = r;
          return { id, staffSessionId, periodId };
        });
      });
      const allResults = await Promise.all(allReqs);
      client.query("COMMIT");
      return allResults;
    } catch (e) {
      client.query("ROLLBACK");
      throw DbError.transactionFailure(
        `Could not assign staff to periods: ${e}`
      );
    } finally {
      client.release();
    }
  }
}
module.exports = Week;
