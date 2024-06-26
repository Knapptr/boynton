const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const { camelCaseProps } = require("../utils/cases");
const { mapToGroups } = require("../utils/aggregation");

const weekRepository = {
  async init() {
    const query = `
        CREATE TABLE IF NOT EXISTS weeks
        (
        "number" integer NOT NULL,
        display CHARACTER VARYING(1) NOT NULL,
        title character varying(255) COLLATE pg_catalog."default" NOT NULL,
        begins DATE NOT NULL,
        ends DATE NOT NULL,
        CONSTRAINT week_pkey PRIMARY KEY ("number"),
        CONSTRAINT "uniqueWeekName" UNIQUE (title),
        CONSTRAINT "uniqueWeekNumber" UNIQUE ("number")
        )
`;
    try {
      await fetchOne(query);
      return true;
    } catch (e) {
      throw new Error(`Cannot init with query: ${query}`)
    }
  },
  /** map response to an array 
  * @param {any[]} dbResponse */
  _mapResponse(dbResponse, getStaff = false) {
    const weeks = [];
    for (const response of dbResponse) {
      //check if the last entry is the same week
      const currentWeek = weeks.at(-1) && weeks.at(-1).number === response.number ? weeks.pop() : {
        title: response.title,
        number: response.number,
        display: response.display,
        begins: response.begins,
        ends: response.ends,
        days: []
      }
      //check if current respose is a new day
      const currentDay = currentWeek.days.at(-1) && currentWeek.days.at(-1).id === response.day_id ? currentWeek.days.pop() : {
        id: response.day_id,
        name: response.day_name,
        periods: []
      };
      // check if current response is a new period
      const currentPeriod = currentDay.periods.at(-1) && currentDay.periods.at(-1).id === response.period_id ? currentDay.periods.pop() : {
        id: response.period_id,
        number: response.period_number,
        allWeek: response.period_all_week
      }
      // check if is activity, check if is staff
      if (response.activity_session_id !== undefined) {
        //create activities field
        if (currentPeriod.activities === undefined) { currentPeriod.activities = [] }
        if (response.activity_session_id !== null) {
          const activity = {
            id: response.activity_id,
            sessionId: response.activity_session_id,
            name: response.activity_name,
            description: response.activity_description
          }
          if (getStaff) {
            if (activity.staff === undefined) { activity.staff = [] }
            if (response.staff_activity_id) {
              const staff = {
                staffActivityId: response.staff_activity_id,
                username: response.staff_username
              }
              activity.staff.push(staff)
            }
          }
          currentPeriod.activities.push(activity)
        }
      }
      currentDay.periods.push(currentPeriod);
      currentWeek.days.push(currentDay);
      weeks.push(currentWeek);
    }
    return weeks
  },
  async getOnDate(date, getStaff = false) {
    console.log({ date });
    const query = !getStaff ? `SELECT 
    w.title AS title,
      w.number AS number,
      w.display as display,
      w.begins as begins,
      w.ends as ends,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number,
      act.id AS activity_id,
      act.name AS activity_name,
      ases.id AS activity_session_id,
      act.description AS activity_description
    FROM weeks w
    LEFT JOIN days d ON d.week_id = w.number
    LEFT JOIN periods p ON p.day_id = d.id  
    FULL JOIN activity_sessions ases ON ases.period_id = p.id
    LEFT JOIN activities act ON ases.activity_id = act.id
    WHERE w.begins <= $1 AND w.ends >= $1
    ORDER BY w.number,d.id,p.period_number
    `: `
    SELECT 
    w.title AS title,
      w.number AS number,
      w.display AS display,
      w.begins as begins,
      w.ends as ends,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number,
      act.id AS activity_id,
      sta.id AS staff_activity_id,
      act.name AS activity_name,
      ases.id AS activity_session_id,
      act.description AS activity_description,
      us.username AS staff_username
    FROM weeks w
    LEFT JOIN days d ON d.week_id = w.number
    LEFT JOIN periods p ON p.day_id = d.id  
    FULL JOIN activity_sessions ases ON ases.period_id = p.id
    LEFT JOIN activities act ON ases.activity_id = act.id
    LEFT JOIN staff_activities sta ON sta.activity_session_id = ases.id
    LEFT JOIN staff_sessions ss ON ss.id = sta.staff_session_id
    LEFT JOIN users us ON ss.username = us.username
    WHERE w.begins <= $1 AND w.ends >= $1
    ORDER BY w.number,d.id,p.period_number,ases.id `;
    const values = [date];
    const responseData = await fetchMany(query, values);
    if (!responseData) {
      return false;
    }
    const mappedData = this._mapResponse(responseData, getStaff);
    return mappedData[0];
  },
  /** Returns all weeks with nested information for days and periods. Activities are not populated */
  async getAll() {
    const query = `SELECT 
    w.title AS title,
      w.number AS number,
      w.display AS display,
      w.begins as begins,
      w.ends as ends,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    ORDER BY w.number,d.id,p.period_number
    `
    const responseData = await fetchMany(query);
    if (!responseData) { return [] }

    const mappedData = this._mapResponse(responseData);
    return mappedData;
  },
  async get(weekNumber, getStaff) {
    const query = !getStaff ? `SELECT 
    w.title AS title,
      w.number AS number,
      w.display AS display,
      w.begins as begins,
      w.ends as ends,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.all_week AS period_all_week,
      p.period_number AS period_number,
      act.id AS activity_id,
      act.name AS activity_name,
      ases.id AS activity_session_id,
      act.description AS activity_description
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    FULL JOIN activity_sessions ases ON ases.period_id = p.id
    LEFT JOIN activities act ON ases.activity_id = act.id
    WHERE w.number = $1
    ORDER BY w.number,d.id,p.period_number
    `: `
    SELECT 
    w.title AS title,
      w.number AS number,
      w.display AS display,
      w.begins as begins,
      w.ends as ends
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number,
      p.all_week AS period_all_week,
      act.id AS activity_id,
      sta.id AS staff_activity_id,
      act.name AS activity_name,
      ases.id AS activity_session_id,
      act.description AS activity_description,
      us.username AS staff_username
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    FULL JOIN activity_sessions ases ON ases.period_id = p.id
    LEFT JOIN activities act ON ases.activity_id = act.id
    LEFT JOIN staff_activities sta ON sta.activity_session_id = ases.id
    LEFT JOIN staffable_sessions ss ON ss.id = sta.staffable_session_id
    LEFT JOIN users us ON ss.username = us.username
    WHERE w.number = $1
    ORDER BY w.number,d.id,p.period_number,ases.id `;
    const values = [weekNumber];
    const responseData = await fetchMany(query, values);
    if (!responseData) {
      return false;
    }
    const mappedData = this._mapResponse(responseData, getStaff);
    return mappedData[0];
  },

  async delete(weekNumber) {
    const query = "DELETE FROM weeks WHERE number = $1 RETURNING *";
    const values = [weekNumber];
    const deletedWeek = await fetchOne(query, values);
    return deletedWeek;
  },
  async create({ title, number, begins, ends, display }) {
    const weekQuery = `INSERT INTO weeks (title,number,begins,ends,display) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const weekValues = [title, number, begins, ends, display];
    const insertWeekResponse = await fetchOne(weekQuery, weekValues);
    if (insertWeekResponse) {
      insertWeekResponse.days = [];
    }
    return insertWeekResponse;
  },
};

module.exports = weekRepository;
