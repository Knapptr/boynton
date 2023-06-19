const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const pool = require("../db/index");
const DbError = require("../utils/DbError");
const Period = require("./period");

class ActivitySession {
  constructor({ name, id, description, activityId, campers, periodId }) {
    this.name = name;
    this.id = id;
    this.description = description;
    this.activityId = activityId;
    this.campers = campers;
    this.periodId = periodId;
  }
  /** Parse the results from the database response
   * @param {data response[]} dbr the response from the database array */
  static _parseResults(dbr) {
    const results = [];
    for (const response of dbr) {
      let activitySession;
      if (results.at(-1) && results.at(-1).id === response.id) {
        activitySession = results.pop();
      } else {
        activitySession = {
          id: response.id,
          name: response.activity_name,
          description: response.description,
          activityId: response.activity_id,
          periodId: response.period_id,
          campers: [],
        };
      }
      if (response.camper_id !== null) {
        activitySession.campers.push({
          firstName: response.first_name,
          lastName: response.last_name,
          sessionId: response.session_id,
          pronouns: response.pronouns,
          age: response.age,
          id: response.camper_id,
        });
      }

      results.push(activitySession);
    }
    return results;
  }

  /** Get all Activity Sessions */
  static async getAll() {
    const query = `
            SELECT 
            act_s.id as id, 
            act_s.period_id as period_id,
            act.name as activity_name ,
            act.description as description,
            act.id as activity_id,
            c.first_name,
            c.last_name,
            c.age,
            c.id as camper_id,
            cw.id as session_id,
            c.pronouns as pronouns
            from activity_sessions as act_s
            JOIN activities act ON act.id = act_s.activity_id
            FULL JOIN camper_activities ca ON ca.activity_id = act_s.id
            LEFT JOIN camper_weeks  cw ON cw.id = ca.camper_week_id
            LEFT JOIN campers c ON cw.camper_id = c.id
            ORDER BY act_s.id,c.last_name
        `;
    const results = await fetchMany(query);
    if (results && results.length > 0) {
      const deserResults = ActivitySession._parseResults(results).map(
        (as) => new ActivitySession(as)
      );
      return deserResults;
    } else {
      return [];
    }
  }

  static async get(activitySessionId) {
    const query = `
            SELECT 
            act_s.id as id, 
            act_s.period_id as period_id,
            act.name as activity_name ,
            act.description as description,
            act.id as activity_id,
            c.first_name,
            c.last_name,
            c.age,
            c.id as camper_id,
            cw.id as session_id,
            c.pronouns as pronouns
            from activity_sessions as act_s
            JOIN activities act ON act.id = act_s.activity_id
            FULL JOIN camper_activities ca ON ca.activity_id = act_s.id
            LEFT JOIN camper_weeks  cw ON cw.id = ca.camper_week_id
            LEFT JOIN campers c ON cw.camper_id = c.id
            WHERE act_s.id = $1
            ORDER BY act_s.id,c.last_name
        `;
    const values = [activitySessionId];

    const results = await fetchMany(query, values);

    if (results && results.length > 0) {
      const deserResults = ActivitySession._parseResults(results).map(
        (as) => new ActivitySession(as)
      );
      // there should only be one result, so return it instead of an array
      return deserResults[0];
    } else {
      return false;
    }
  }
  static async create(activityId, periodId) {
    const query = `
WITH target_period AS(
SELECT 
p.id,
p.period_number,
p.all_week,
w.number as week_number
from periods p
JOIN days d on p.day_id = d.id
JOIN weeks w on w.number = d.week_id
where p.id=$1)

INSERT INTO activity_sessions (period_id,activity_id)
SELECT p.id as period_id, $2 as activity_id
FROM target_period
JOIN periods p ON p.id = target_period.id 
OR p.period_number = target_period.period_number AND target_period.all_week = true
JOIN days d ON d.id = p.day_id
JOIN weeks w ON w.number = d.week_id AND w.number = target_period.week_number
RETURNING *`
    const values = [periodId,activityId]
    const result = await pool.query(query,values)
    if(result.rows.length === 0){return false}
    return result.rows.map(r=>({
      id: r.id,
      activityId: r.activityId,
      periodId: r.period_id
    }))

  }
  
  async delete() {
    const query = `
      WITH target_period AS(
      SELECT 
      p.id,
      p.period_number,
      p.all_week,
      w.number as week_number
      from periods p
      JOIN days d on p.day_id = d.id
      JOIN weeks w on w.number = d.week_id
      where p.id=$1)

      DELETE FROM activity_sessions acts WHERE acts.id IN(
      SELECT 
      acts.id
      FROM
      periods p
      JOIN target_period tp ON tp.id = p.id OR tp.all_week = true AND p.period_number = tp.period_number
      JOIN days d ON d.id = p.day_id
      JOIN weeks w ON d.week_id = w.number AND w.number = tp.week_number
      JOIN activity_sessions acts ON acts.period_id = p.id AND acts.activity_id = $2
          )
      RETURNING *
    `
    const values = [this.periodId,this.activityId]
    const results = await pool.query(query,values);
    if(results.rows.length === 0){return false}
    return results.rows.map(r=>({
      id: r.id,
      activityId: r.activity_id,
      periodId: r.period_id
    }))

  }

  async addCampers(campersList) {
   const query = `
    WITH target_activity_session AS (SELECT acts.id,acts.activity_id,w.number as week_number, p.period_number, p.id as period_id, p.all_week as all_week
    FROM activity_sessions acts 
    JOIN periods p on acts.period_id = p.id   
    JOIN days d on d.id = p.day_id
    JOIN weeks w on w.number = d.week_id                                 
    WHERE acts.id = $1),
    target_campers AS (
    SELECT * from camper_weeks cw WHERE cw.id = ANY($2))

    INSERT INTO camper_activities (period_id,activity_id,camper_week_id)
    SELECT 
    p.id as period_id, acts.id as activity_session_id, tc.id as camper_session_id
    FROM target_activity_session tas
    JOIN periods p ON tas.all_week AND p.period_number = tas.period_number OR p.id = tas.period_id
    JOIN days d on d.id = p.day_id
    JOIN weeks w on w.number = d.week_id AND w.number = tas.week_number
    JOIN activity_sessions acts ON acts.period_id = p.id AND acts.activity_id = tas.activity_id
    JOIN activities act ON act.id = acts.activity_id
    CROSS JOIN target_campers tc
    ON CONFLICT ON CONSTRAINT "one_activity_per_camper"
    DO UPDATE SET activity_id = excluded.activity_id, period_id = excluded.period_id, is_present = false 
    RETURNING *
    `

    const camperSessionIds = campersList.map(c=>c.camperSessionId)
    const values = [this.id,camperSessionIds];
    const results = await pool.query(query,values);
    const data = results.rows;
    if(data.length ===0){return false}
    return data.map(r=>({
      periodId: r.period_id,
      activitySessionId: r.activity_id,
      id: r.id
    }))
  }
  async addStaff(staff) {
    const client = await pool.connect();
    try {
      client.query("BEGIN");
      const allQueries = staff.map((staffer) =>
        client.query(
          `INSERT INTO staff_activities (activity_session_id, staff_session_id,period_id) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT "one staff assignment per period" DO UPDATE SET activity_session_id = $1  returning *`,
          [this.id, staffer.staffSessionId, this.periodId]
        )
      );
      const results = await Promise.all(allQueries);
      await client.query("COMMIT");
      const staffActivitySessions = results.map((r) =>
        r.rows.map((dbSession) => ({
          activitySessionId: dbSession.activity_session_id,
          staffSessionId: dbSession.staff_session_id,
          id: dbSession.id,
        }))
      );
      return staffActivitySessions;
    } catch (e) {
      client.query("ROLLBACK");
      console.log("ERROR", e);
      throw DbError.transactionFailure("Staff add transaction failed");
    } finally {
      client.release();
    }
  }
}

module.exports = ActivitySession;
