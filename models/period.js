const mapManyToOne = require("../utils/remap");
const Activity = require("./activity");
const defaultPeriodRepository = require("../repositories/period");
const { fetchManyAndCreate, fetchMany } = require("../utils/pgWrapper");
const pool = require("../db");
const DbError = require("../utils/DbError");

class Period {
  constructor({
    number,
    dayId,
    id,
    allWeek = false,
    activities,
    weekNumber,
    weekDisplay,
    weekTitle,
    dayName,
  }) {
    (this.number = number), (this.dayId = dayId);
    this.allWeek = allWeek;
    (this.weekNumber = weekNumber),
      (this.dayName = dayName),
      (this.activities = activities || []);
    this.id = id;
    (this.weekTitle = weekTitle), (this.weekDisplay = weekDisplay);
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
  static async create(
    { number, dayId, allWeek = false },
    periodRepository = defaultPeriodRepository
  ) {
    const result = await periodRepository.create({ number, dayId, allWeek });
    if (!result) {
      throw new Error("Cannot create period.");
    }
    return new Period(result);
  }
  static async getAll(periodRepository = defaultPeriodRepository) {
    const periods = await periodRepository.getAll();
    if (!periods) {
      return false;
    }
    return periods.map((p) => new Period(p));
  }
  static async get(id, periodRepository = defaultPeriodRepository) {
    const period = await periodRepository.get(id);
    if (!period) {
      return false;
    }
    return new Period(period);
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
  async getCampers() {
    const query = `
		SELECT  
	        c.first_name,
	        c.last_name,
			c.age,
			c.pronouns,
	        ca.activity_id,
	        cw.id as camper_session_id, 
	        ca.is_present,
	        act.name as activity_name,
	        ca.id as camper_activity_id,
			cab.name as cabin_name
	        from camper_weeks cw
			JOIN days d ON d.week_id = cw.week_id
	        JOIN periods p ON p.day_id = d.id
	        JOIN campers c ON cw.camper_id = c.id
	        LEFT JOIN camper_activities ca ON ca.period_id = p.id AND ca.camper_week_id = cw.id
	        LEFT JOIN activity_sessions act_s ON act_s.id = ca.activity_id
	        LEFT JOIN activities act ON act.id = act_s.activity_id
	        JOIN cabin_sessions cs ON cw.cabin_session_id = cs.id
	        JOIN cabins cab ON cab.name = cs.cabin_name
	        WHERE p.id = $1
		`;
    const values = [this.id];
    const queryResult = (await fetchMany(query, values)) || [];
    const parsedQuery = queryResult.map((res) => {
      return {
        camperActivityId: res.camper_activity_id,
        sessionId: res.camper_session_id,
        weekId: res.week_id,
        firstName: res.first_name,
        lastName: res.last_name,
        age: res.age,
        cabin: res.cabin_name,
        isPresent: res.is_present,
        activityId: res.activity_id || "Unassigned",
        activityName: res.activity_name,
      };
    });
    this.activities.push({ name: "Unassigned", id: "Unassigned" });
    this.activities = this.activities.map((act) => {
      const campersInActivity = parsedQuery.filter(
        (c) => c.activityId === act.id
      );
      return { ...act, campers: campersInActivity };
    });
    return parsedQuery;
  }

  async assignStaffOn(staffList) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allReqs = staffList.map(async(s) => {
        const query =
          "INSERT INTO staff_on_periods (staff_session_id,period_id) VALUES ($1,$2) RETURNING *";
        const values = [s.id, this.id];

	const results = await client.query(query, values)
        return results ;
      });
      const allResults = await Promise.all(allReqs);
      const staffOnPeriods = allResults.map((r) => {
        const {
          id,
          staff_session_id: staffSessionId,
          period_id: periodId,
        } = r.rows[0];
        return { id, staffSessionId, periodId };
      });
      await client.query("COMMIT");
      return staffOnPeriods;
    } catch (e) {
      client.query("ROLLBACK");
      throw  DbError.transactionFailure("Error assigning staff");
    } finally {
      client.release();
    }
  }
  async removeStaffOn(staffList){
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allReqs = staffList.map(async(s) => {
        const query =
          "DELETE FROM staff_on_periods WHERE staff_session_id = $1 AND period_id = $2 RETURNING *";
        const values = [s.id, this.id];

	const results = await client.query(query, values)
        return results ;
      });
      const allResults = await Promise.all(allReqs);
      const staffOnPeriods = allResults.map((r) => {
        const {
          id,
          staff_session_id: staffSessionId,
          period_id: periodId,
        } = r.rows[0];
        return { id, staffSessionId, periodId };
      });
      await client.query("COMMIT");
      return staffOnPeriods;
    } catch (e) {
      client.query("ROLLBACK");
      throw  DbError.transactionFailure("Error deleting staff");
    } finally {
      client.release();
    }

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
