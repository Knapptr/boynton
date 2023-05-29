const { fetchOne, fetchMany } = require("../utils/pgWrapper");

module.exports = {
  async init() {
    const query = `
    CREATE TABLE IF NOT EXISTS periods
    (
    id serial NOT NULL  ,
    day_id integer NOT NULL  ,
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
      throw new Error(`Cannot init with query: ${query}`)
    }
  },
  _mapResponse(dbResponse) {
    return dbResponse.reduce((acc, cv) => {
      const currentActivity = {
        name: cv.activity_name,
        description: cv.activity_description,
        activityId: cv.activity_id,
        activitySessionId: cv.activity_session_id
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
      p.id, 
      act.name as activity_name,
      act.description as activity_description,
      act.id as activity_id,
      act_s.id as activity_session_id
      FROM periods p 
      LEFT JOIN activity_sessions act_s ON act_s.period_id = p.id
      LEFT JOIN activities act ON act.id = act_s.activity_id
`
    const results = await fetchMany(query);
    if (!results) {
      return [];
    }
    const mapped = this._mapResponse(results);
    return mapped;
  },
  /** Get single period, and populate camper lists 
  * @param id period id*/
  async get(id) {
    const query = `
      SELECT 
      day_id,
      period_number,
      p.id, 
      act.name as activity_name,
      act.description as activity_description,
      act.id as activity_id,
      act_s.id as activity_session_id,
      camp.last_name AS camper_last_name,
      camp.first_name AS camper_first_name,
      camp.pronouns AS camper_pronouns,
      camp.age AS camper_age,
      cw.id AS camper_session_id,
      ca.is_present AS camper_is_present,
      ca.id AS camper_activity_id
      FROM periods p 
      LEFT JOIN activity_sessions act_s ON act_s.period_id = p.id
      LEFT JOIN activities act ON act.id = act_s.activity_id
      LEFT JOIN camper_activities ca ON ca.activity_id = act_s.id
      LEFT JOIN camper_weeks cw ON cw.id = ca.camper_week_id
      LEFT JOIN campers camp ON camp.id = cw.camper_id
      WHERE p.id = $1
      ORDER BY act_s.id
    `;
    const values = [id];
    const results = await fetchMany(query, values);
    console.log({ results });
    if (!results) {
      return false;
    }
    // deserialize into:
    // period 
    // { id,
    // dayId,
    // periodNumber,
    // activities: {
    // activityName,
    // activityDescription
    // activityId,
    // activitySessionId,
    // campers {firstName,lastName,age,pronouns,sessionId}[]
    // }[]}
    const oneRes = results[0];
    const period = { id: oneRes.id, dayId: oneRes.day_id, periodNumber: oneRes.periodNumber, activities: [] }
    for (const data of results) {
      //check if current activity is == to last activity
      let activity = { name: data.activity_name, description: data.activity_description, activityId: data.activity_id, sessionId: data.activity_session_id, campers: [] }

      if (period.activities.at(-1) && period.activities.at(-1).sessionId === data.activity_session_id) {
        activity = period.activities.pop()
      }
      if (data.camper_session_id !== null) {
        activity.campers.push(
          {
            firstName: data.camper_first_name,
            lastName: data.camper_last_name,
            age: data.camper_age,
            pronouns: data.camper_pronouns,
            sessionId: data.camper_session_id,
            isPresent: data.camper_is_present,
            activityId: data.camper_activity_id
          }
        )
      }
      period.activities.push(activity);
    }
    return period
  },
  async create({ dayId, number }) {
    const query = `INSERT INTO periods (day_id,period_number) VALUES ($1,$2) RETURNING *`;
    const values = [dayId, number];
    const response = await fetchOne(query, values);
    if (!response) {
      return false;
    }
    return {
      id: response.id,
      number: response.period_number,
      dayId: response.day_id,
    };
  },
};
