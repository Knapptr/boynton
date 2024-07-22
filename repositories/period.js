const pool = require("../db");
const DbError = require("../utils/DbError");
const { fetchOne, fetchMany } = require("../utils/pgWrapper");

module.exports = {
  async init() {
    const query = `
    CREATE TABLE IF NOT EXISTS periods
    (
    id serial NOT NULL  ,
    day_id integer NOT NULL  ,
    all_week boolean DEFAULT false,
    period_number integer NOT NULL,
    CONSTRAINT period_pkey PRIMARY KEY (id),
    CONSTRAINT day_id FOREIGN KEY (day_id)
    REFERENCES days (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE
    NOT VALID
    )
`;
    try {
      await fetchOne(query);
      return true;
    } catch (e) {
      throw new Error(`Cannot init with query: ${query}`);
    }
  },
  _mapResponse(dbResponse) {
    return dbResponse.reduce((acc, cv) => {
      const currentActivity = {
        name: cv.activity_name,
        description: cv.activity_description,
        activityId: cv.activity_id,
        activitySessionId: cv.activity_session_id,
      };
      const currentPeriod = acc.find((p) => p.id === cv.id);
      if (currentPeriod) {
        currentPeriod.activities.push(currentActivity);
        return acc;
      }
      acc.push({
        id: cv.id,
        number: cv.period_number,
        dayId: cv.day_id,
        activities: [currentActivity],
      });
      return acc;
    }, []);
  },

  async getAll() {
    const query = `
      SELECT 
      day_id,
      period_number,
      all_week,
      p.id, 
      act.name as activity_name,
      act.description as activity_description,
      act.id as activity_id,
      act_s.id as activity_session_id
      FROM periods p 
      LEFT JOIN activity_sessions act_s ON act_s.period_id = p.id
      LEFT JOIN activities act ON act.id = act_s.activity_id
`;
    const results = await fetchMany(query);
    if (!results) {
      return [];
    }
    const mapped = this._mapResponse(results);
    return mapped;
  },

  /** Get single period, and populate camper and staff lists
   * @param id period id*/
  // TODO rework this as a transaction
  async get(id) {
    const client = await pool.connect();
    try {
      // get period data
      const periodDataQuery = `
     SELECT 
      day_id,
      period_number,
      all_week,
      w.number as week_number,
      w.display as week_display,
      w.title as week_title,
      d.name as day_name,
      p.id as period_id
      FROM periods p
    JOIN days d ON d.id = p.day_id
      JOIN weeks w ON w.number = d.week_id
      WHERE p.id = $1`;
      const periodDataValues = [id];
      const periodResult = await client.query(
        periodDataQuery,
        periodDataValues
      );
      if (periodResult.rowCount === 0) {
        throw DbError.notFound("Period not found");
      }
      // initialize period with data
      const res = periodResult.rows[0];
      const period = {
        id: res.period_id,
        number: res.period_number,
        allWeek: res.all_week,
        weekNumber: res.week_number,
        weekTitle: res.week_title,
        weekDisplay: res.week_display,
        dayName: res.day_name,
        activities: []
      };
      // initialize activity id object
      const activitiesById = {};
      // get activities and campers
      const activitiesCampersQuery = `
        SELECT
        act.id as activity_id,
        acts.location as location,
        act.name as activity_name,
        acts.id as activity_session_id,
        camp.first_name as camper_first,
        camp.last_name as camper_last,
        campw.id as camper_week_id,
        camp.id as camper_id,
        campact.id as camper_activity_id,
        cabin.name as cabin_name,
      campact.is_present as is_present
        FROM
        activity_sessions acts
        JOIN periods per ON acts.period_id = per.id
        JOIN activities act ON act.id = acts.activity_id
        LEFT JOIN camper_activities campact ON campact.activity_id = acts.id
        LEFT JOIN camper_weeks campw ON campw.id = campact.camper_week_id
        LEFT JOIN campers camp ON campw.camper_id = camp.id
        LEFT JOIN cabin_sessions cabsess ON cabsess.id = campw.cabin_session_id
        LEFT JOIN cabins cabin ON cabin.name = cabsess.cabin_name
        WHERE acts.period_id = $1`;
      const activitiesCampersValues = [id];
      const activitiesCampersResult = await client.query(
        activitiesCampersQuery,
        activitiesCampersValues
      );
      // if (activitiesCampersResult.rowCount === 0) {
      //   throw DbError.notFound("No Activities Found");
      // }
      activitiesCampersResult.rows.forEach((act) => {
        // define local vars for the for each function
        const {
          activity_id: activityId,
          activity_name: activityName,
          location: location,
          camper_id: camperId,
          activity_session_id: activitySessionId,
          camper_first: camperFirst,
          camper_last: camperLast,
          camper_week_id: camperWeekId,
          cabin_name: cabin,
          camper_activity_id: camperActivityId,
          is_present: isPresent
        } = act;
        const activityData = {
          id: activityId,
          name: activityName,
          location:location,
          sessionId: activitySessionId,
          campers: [],
          staff: [],
        };
        // check sorted by id list for activity id
        // if not exists, create it
        if (!activitiesById[activitySessionId]) {
          activitiesById[activitySessionId] = activityData;
        }
        // if camper info, add camper to camper list
        if (camperWeekId !== null) {
          activitiesById[activitySessionId].campers.push({
            id: camperId,
            firstName:camperFirst,
            lastName: camperLast,
            sessionId: camperWeekId,
            cabin,
            isPresent,
            activityId :camperActivityId
          });
        }
      });
      // get activities and staff
      const activityStaffQuery = `
        SELECT
        acts.id as activity_session_id,
        users.first_name,
        users.last_name,
        users.username,
      sop.id as staff_on_period_id
        FROM
        activity_sessions acts
        JOIN periods per ON acts.period_id = per.id
        JOIN activities act ON act.id = acts.activity_id
        JOIN staff_on_periods sop ON sop.activity_session_id = acts.id
        JOIN staff_sessions ss ON ss.id = sop.staff_session_id
        JOIN users ON users.username = ss.username
        WHERE acts.period_id = $1
      `;
      const activityStaffValues = [id];
      const activityStaffResults = await client.query(
        activityStaffQuery,
        activityStaffValues
      );
      // add staff members to staff list for each activity
      activityStaffResults.rows.forEach((st) => {
        const activitySessionId = st.activity_session_id;
        const {
          first_name: firstName,
          last_name: lastName,
          username: username,
          staff_on_period_id: staffOnPeriodId
        } = st;
        activitiesById[activitySessionId].staff.push({
          firstName,
          lastName,
          username,
          staffOnPeriodId
        });
      });
      // add activities to period object
      period.activities = [...Object.values(activitiesById)];
      await client.query("COMMIT");
      return period;
    } catch (e) {
      console.log({e});
      client.query("ROLLBACK");
      return false;
    } finally {
      client.release();
    }
    // const query = `
    // SELECT * from
    // ( SELECT
    //   day_id,
    //   period_number,
    // all_week,
    //   w.number as week_number,
    //   w.display as week_display,
    //   w.title as week_title,
    //   d.name as day_name,
    //   p.id as period_id,
    //   act.name as activity_name,
    //   act.description as activity_description,
    //   act.id as activity_id,
    //   act_s.id as activity_session_id,
    //   camp.last_name AS camper_last_name,
    //   camp.id AS camper_id,
    //   camp.first_name AS camper_first_name,
    //   camp.pronouns AS camper_pronouns,
    //   camp.age AS camper_age,
    //   cab.name AS camper_cabin_assignment,
    //   cw.id AS camper_session_id,
    //   ca.is_present AS camper_is_present,
    //   ca.id AS camper_activity_id,
    //   null AS staff_username,
    //   null AS staff_first_name,
    //   null AS staff_last_name,
    //   null AS staff_lifeguard,
    //   null AS staff_ropes,
    //   null AS staff_archery,
    //   null AS staff_first_year,
    //   null AS staff_senior,
    //   null AS staff_session_id,
    //   null AS staff_activity_id
    //   FROM periods p
    //   JOIN days d ON p.day_id = d.id
    //   JOIN weeks w ON w.number = d.week_id
    //   LEFT JOIN activity_sessions act_s ON act_s.period_id = p.id
    //   LEFT JOIN activities act ON act.id = act_s.activity_id
    //   LEFT JOIN camper_activities ca ON ca.activity_id = act_s.id
    //   LEFT JOIN camper_weeks cw ON cw.id = ca.camper_week_id
    //   LEFT JOIN cabin_sessions cabs ON cw.cabin_session_id = cabs.id
    //   LEFT JOIN cabins cab ON cab.name = cabs.cabin_name
    //   LEFT JOIN campers camp ON camp.id = cw.camper_id
    //   WHERE p.id = $1

    //   UNION ALL

    //   SELECT
    //   day_id,
    //   period_number,
    // all_week,
    //   w.number as week_number,
    //   w.display as week_display,
    //   w.title as week_title,
    //   d.name as day_name,
    //   p.id as period_id,
    //   act.name as activity_name,
    //   act.description as activity_description,
    //   act.id as activity_id,
    //   act_s.id as activity_session_id,
    //   null AS camper_last_name,
    //   null AS camper_cabin_assignment,
    //   null AS camper_first_name,
    //   null AS camper_pronouns,
    //   null AS camper_age,
    //   null AS camper_session_id,
    //   null AS camper_is_present,
    //   null AS camper_activity_id,
    //   null AS camper_id,
    //   u.username AS staff_username,
    //   u.first_name AS staff_first_name,
    //   u.last_name AS staff_last_name,
    //   u.lifeguard AS staff_lifeguard,
    //   u.ropes AS staff_ropes,
    //   u.archery AS staff_archery,
    //   u.first_year AS staff_first_year,
    //   u.senior AS staff_senior,
    //   stafsess.id AS staff_session_id,
    //   stafact.id AS staff_activity_id
    //   FROM periods p
    //   JOIN days d ON d.id = p.day_id
    //   JOIN weeks w ON w.number = d.week_id
    //   LEFT JOIN activity_sessions act_s ON act_s.period_id = p.id
    //   LEFT JOIN activities act ON act.id = act_s.activity_id
    //   LEFT JOIN staff_activities stafact ON  stafact.activity_session_id = act_s.id
    //   LEFT JOIN staff_sessions stafsess ON stafsess.id = stafact.staff_session_id
    //   LEFT JOIN users u ON u.username = stafsess.username) un
    //   WHERE period_id = $1

    //   ORDER BY activity_session_id, camper_last_name, staff_first_name

    // `;
  },
  async create({ dayId, number, allWeek = false }) {
    const query = `INSERT INTO periods (day_id,period_number,all_week) VALUES ($1,$2,$3) RETURNING *`;
    const values = [dayId, number, allWeek];
    const response = await fetchOne(query, values);
    if (!response) {
      return false;
    }
    return {
      id: response.id,
      number: response.period_number,
      allWeek: response.all_week,
      dayId: response.day_id,
    };
  },
};
