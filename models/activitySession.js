const pool = require("../db/index");
const DbError = require("../utils/DbError");
const Period = require("./period");

class ActivitySession {
  constructor({
    name,
    id,
    capacity,
    description,
    activityId,
    periodId,
    dayId,
    dayName,
    weekTitle,
    weekDisplay,
    weekNumber,
    periodNumber,
    campers = [],
    staff = [],
    overflow = {},
  }) {
    this.name = name;
    this.id = id;
    this.description = description;
    this.activityId = activityId;
    this.campers = campers;
    this.capacity = capacity;
    this.periodId = periodId;
    this.weekTitle = weekTitle;
    this.weekNumber = weekNumber;
    this.weekDisplay = weekDisplay;
    this.dayName = dayName;
    this.periodNumber = periodNumber;
    this.dayId = dayId;
    this.campers = campers;
    this.staff = staff;
    this.overflow = overflow;
  }

  /** Get all Activity Sessions */
  static async getAll() {
    const sessionsQuery = `
            SELECT 
            act_s.id as id, 
            act_s.period_id as period_id,
            act.name as activity_name ,
      act.capacity as activity_capacity,
            act.description as description,
            act.id as activity_id,
            c.first_name,
            c.last_name,
            c.age,
            c.id as camper_id,
            cw.id as session_id,
            c.pronouns as pronouns,
            cab.name as cabin
            from activity_sessions as act_s
            JOIN activities act ON act.id = act_s.activity_id
            FULL JOIN camper_activities ca ON ca.activity_id = act_s.id
            LEFT JOIN camper_weeks  cw ON cw.id = ca.camper_week_id
            LEFT JOIN campers c ON cw.camper_id = c.id
            LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
            LEFT JOIN cabins cab ON cab.name = cs.cabin_name
            ORDER BY act_s.id,c.last_name
        `;
    const { rows } = await pool.query(sessionsQuery);
    if (rows && rows.length > 0) {
      const mappedResult = rows.reduce((acc, cv) => {
        let currentActivity = acc[cv.id];
        const currentCamper = cv.camper_id && {
          firstName: cv.first_name,
          lastName: cv.last_name,
          age: cv.age,
          cabin: cv.cabin,
          camperId: cv.camper_id,
          sessionId: cv.session_id,
          pronouns: cv.pronouns,
        };
        if (currentActivity && currentCamper) {
          currentActivity.campers.push(currentCamper);
        } else {
          const initialCampers = (currentCamper && [currentCamper]) || [];
          currentActivity = {
            id: cv.id,
            periodId: cv.period_id,
            activityName: cv.activity_name,
            capacity: cv.activity_capacity,
            description: cv.description,
            activityId: cv.activity_id,
            campers: initialCampers,
          };
          // cv[cv.id] = currentActivity;
        }
        acc[cv.id] = currentActivity;
        return acc;
      }, {});
      // turn object back into an array
      return Object.values(mappedResult);
    } else {
      return [];
    }
  }
  // at the moment this is exclusively for the sign up of capacity activities
  // It will send the information for the first session of each capacity activity, but through the *magic* of the addCampers method on ActivitySession, campers will be
  // automatically placed in an 'overflow' activity if the first session is full
  static async getCapacityActs(weekNumber) {
    const query = `
    SELECT 
    act_s.id as activity_session_id,
    act.name as activity_name,
    act.capacity as activity_capacity,
    act.id as activity_id
    FROM activity_sessions act_s
    JOIN activities act ON act.id = act_s.activity_id
    JOIN periods p ON p.id = act_s.period_id
    JOIN days d ON d.id = p.day_id
    JOIN weeks w ON w.number = d.week_id
    WHERE w.number = $1 AND act.capacity IS NOT NULL
    ORDER BY d.id
    `;
    const values = [weekNumber];

    const response = await pool.query(query, values);

    const [_actSet, capacityActivityList] = response.rows.reduce(
      (acc, cv) => {
        const [set, list] = acc;
        if (set[cv.activity_id] === undefined) {
          set[cv.activity_id] = true;
          list.push({
            id: cv.activity_session_id,
            name: cv.activity_name,
            capacity: cv.activity_capacity,
            activityId: cv.activity_id,
          });
        }
        return acc;
      },
      [{}, []]
    );
    console.log({ capacityActivityList });
    return capacityActivityList;
  }

  static async get(activitySessionId) {
    // get actvity sessoninfo
    const activitySessionQuery = `
SELECT 
    act_s.id as id,
      act.capacity as capacity,
      act_s.period_id as period_id,
      act.name as activity_name,
      act.description as activity_description,
      act.id as activity_id,
    pe.period_number as period_number,
    d.name as day_name,
    d.id as day_id,
      w.number as week_number,
      w.display as week_display,
      w.title as week_title
      FROM activity_sessions act_s
      JOIN activities act ON act.id = act_s.activity_id
      JOIN periods pe ON pe.id = act_s.period_id
      JOIN days d ON d.id = pe.day_id
      JOIN weeks w ON w.number = d.week_id
      WHERE act_s.id = $1

    `;
    const activitySessionValues = [activitySessionId];

    const response = await pool.query(
      activitySessionQuery,
      activitySessionValues
    );
    if (response.rowCount === 0) {
      return false;
    }
    const {
      id,
      capacity: capacity,
      period_id: periodId,
      period_number: periodNumber,
      activity_name: name,
      activity_description: description,
      activity_id: activityId,
      day_name: dayName,
      day_id: dayId,
      week_number: weekNumber,
      week_display: weekDisplay,
      week_title: weekTitle,
    } = response.rows[0];
    // get campers

    const camperQuery = `
        SELECT first_name, last_name, camper_id,age, camper_week_id, pronouns, fl, day_camp, cabin_name as cabin from
    camper_activities cact
    JOIN camper_weeks cw ON cw.id = cact.camper_week_id
    JOIN campers ca ON ca.id = cw.camper_id
    LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
    WHERE cact.activity_id = $1
    `;
    const camperValues = [activitySessionId];
    const camperResponse = await pool.query(camperQuery, camperValues);
    const campers = camperResponse.rows.map((c) => ({
      firstName: c.first_name,
      lastName: c.last_name,
      age: c.age,
      cabin: c.cabin,
      camperId: c.camper_id,
      camperWeekId: c.camper_week_id,
      pronouns: c.pronouns,
      fl: c.fl,
      dayCamp: c.day_camp,
    }));

    const staffQuery = `
    SELECT first_name, last_name, ss.username
    from
    staff_on_periods sop
    JOIN staff_sessions ss ON sop.staff_session_id = ss.id
    JOIN users ON users.username = ss.username
    WHERE sop.activity_session_id = $1
    `;
    const staffValues = [activitySessionId];
    const staffResponse = await pool.query(staffQuery, staffValues);
    const staff = staffResponse.rows.map((s) => ({
      firstName: s.first_name,
      lastName: s.last_name,
      username: s.username,
    }));

    // if has capacity - get overflow optons
    let overflowActivities = {};
    if (capacity !== undefined) {
      const overflowQuery = `
      SELECT 
      act_s.id as activity_session_id,
      act.name as activity_name,
      act.capacity as capacity,
      act_s.period_id as period_id,
      COUNT(ca.camper_week_id)::int as camper_count
      FROM activity_sessions act_s 
      JOIN activities act ON act.id = act_s.activity_id
      JOIN periods p ON act_s.period_id = p.id
      JOIN days d ON p.day_id = d.id
      JOIN weeks w ON w.number = d.week_id
      LEFT JOIN camper_activities ca ON ca.activity_id = act_s.id
      WHERE act_s.activity_id = $1 AND  w.number = $2 AND act_s.id != $3 AND act_s.id > $1
      GROUP BY (act_s.id,act.name,act.capacity)
      `;
      const overflowValues = [activityId, weekNumber, activitySessionId];
      const response = await pool.query(overflowQuery, overflowValues);
      response.rows.forEach((r) => {
        overflowActivities[r.activity_session_id] = {
          id: r.activity_session_id,
          totalEnrollment: r.camper_count,
          periodId: r.period_id,
        };
      });
    }

    return new ActivitySession({
      name,
      id,
      description,
      activityId,
      periodId,
      periodNumber,
      dayName,
      weekTitle,
      weekDisplay,
      weekNumber,
      campers,
      staff,
      dayId,
      overflow: overflowActivities,
      capacity,
    });
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
RETURNING *`;
    const values = [periodId, activityId];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return false;
    }
    return result.rows.map((r) => ({
      id: r.id,
      activityId: r.activityId,
      periodId: r.period_id,
    }));
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
    `;
    const values = [this.periodId, this.activityId];
    const results = await pool.query(query, values);
    if (results.rows.length === 0) {
      return false;
    }
    return results.rows.map((r) => ({
      id: r.id,
      activityId: r.activity_id,
      periodId: r.period_id,
    }));
  }

  async addCampers(campersList) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      let thisTotalCampers = this.campers.length;
      const overflow = this.overflow;

      const getLowestEnrollmentInfo = () => {
        return Object.values(overflow).reduce(
          (acc, cv) => {
            console.log({ cv });
            if (cv.totalEnrollment < acc.totalEnrollment) {
              acc.totalEnrollment = cv.totalEnrollment;
              acc.periodId = cv.periodId;
              acc.id = cv.id;
            }
            return acc;
          },
          {
            id: this.id,
            periodId: this.periodId,
            totalEnrollment: thisTotalCampers,
          }
        );
      };
      const handleEnrollmentIncrement = (id) => {
        if (id === this.id) {
          thisTotalCampers += 1;
        } else {
          overflow[id].totalEnrollment += 1;
        }
      };
      const allReqs = campersList.map(async (c) => {
        const insertQuery = `
        INSERT INTO camper_activities (period_id,activity_id,camper_week_id) 
        VALUES ($1, $2, $3)
        ON CONFLICT ON CONSTRAINT "one_activity_per_camper"
        DO UPDATE SET activity_id = excluded.activity_id, period_id = excluded.period_id, is_present = false
        RETURNING *
        `;
        const targetSession = getLowestEnrollmentInfo();
        const values = [targetSession.periodId, targetSession.id, c.sessionId];
        console.log({ values });

        // make request
        const result = await client.query(insertQuery, values);
        // increment accordingly
        handleEnrollmentIncrement(targetSession.id);

        return result;
      });
      const allResults = await Promise.all(allReqs);
      const allInserts = allResults.map((r) => r.rows[0]);
      await client.query("COMMIT");
      return allInserts;
    } catch (e) {
      client.query("ROLLBACK");
      throw new Error("Transaction failed: " + e);
    } finally {
      client.release();
    }

    /// OLD method
    // const query = `
    // WITH target_activity_session AS (SELECT acts.id,acts.activity_id,w.number as week_number, p.period_number, p.id as period_id, p.all_week as all_week
    // FROM activity_sessions acts
    // JOIN periods p on acts.period_id = p.id
    // JOIN days d on d.id = p.day_id
    // JOIN weeks w on w.number = d.week_id
    // WHERE acts.id = $1),
    // target_campers AS (
    // SELECT * from camper_weeks cw WHERE cw.id = ANY($2))

    // INSERT INTO camper_activities (period_id,activity_id,camper_week_id)
    // SELECT
    // p.id as period_id, acts.id as activity_session_id, tc.id as camper_session_id
    // FROM target_activity_session tas
    // JOIN periods p ON tas.all_week AND p.period_number = tas.period_number OR p.id = tas.period_id
    // JOIN days d on d.id = p.day_id
    // JOIN weeks w on w.number = d.week_id AND w.number = tas.week_number
    // JOIN activity_sessions acts ON acts.period_id = p.id AND acts.activity_id = tas.activity_id
    // CROSS JOIN target_campers tc
    // ON CONFLICT ON CONSTRAINT "one_activity_per_camper"
    // DO UPDATE SET activity_id = excluded.activity_id, period_id = excluded.period_id, is_present = false
    // RETURNING *
    // `;

    // const camperSessionIds = campersList.map((c) => c.camperSessionId);
    // const values = [this.id, camperSessionIds];
    // const results = await pool.query(query, values);
    // const data = results.rows;
    // if (data.length === 0) {
    //   return false;
    // }
    // return data.map((r) => ({
    //   periodId: r.period_id,
    //   activitySessionId: r.activity_id,
    //   id: r.id,
    // }));
  }
  async addStaff(staffOns) {
    console.log({ staff: staffOns });
    // assign the activity_session_id to the staff_on_period
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allQueries = staffOns.map((sop) => {
        const updateQuery = `UPDATE staff_on_periods SET activity_session_id = $1 WHERE id = $2`;
        const updateValues = [this.id, sop.id];
        return client.query(updateQuery, updateValues);
      });
      await Promise.all(allQueries);
      await client.query("COMMIT");
      return true;
    } catch (e) {
      client.query("ROLLBACK");
      return false;
    } finally {
      client.release();
    }
    // const staffSessionIds = staffOns.map((c) => c.staffSessionId);
    // const values = [this.id, staffSessionIds];
    // const results = await pool.query(query, values);
    // const data = results.rows;
    // if (data.length === 0) {
    //   return false;
    // }
    // return data.map((r) => ({
    //   periodId: r.period_id,
    //   activitySessionId: r.activity_id,
    //   id: r.id,
    // }));
  }
}

module.exports = ActivitySession;
