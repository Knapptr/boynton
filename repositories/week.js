const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const { camelCaseProps } = require("../utils/cases");
const { mapToGroups } = require("../utils/aggregation");

const weekRepository = {
  async init() {
    const query = `
        CREATE TABLE IF NOT EXISTS weeks
        (
        "number" integer NOT NULL,
        title character varying(255) COLLATE pg_catalog."default" NOT NULL,
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
  _mapResponse(dbResponse) {
    const camelCased = dbResponse.map((w) => camelCaseProps(w));
    console.log({ camelCased });
    const asWeeks = camelCased.reduce((acc, weekRes) => {
      if (acc.at(-1) === undefined) {
        const initialData = {
          title: weekRes.title,
          number: weekRes.number,
          days: [{
            name: weekRes.dayName,
            id: weekRes.dayId,
            periods: [{
              id: weekRes.periodId,
              number: weekRes.periodNumber,
              activities: []
            }]
          }]
        }
        if (weekRes.activityId !== null) {
          initialData.days.at(-1).periods.at(-1).activities.push(
            {
              activityId: weekRes.activityId,
              sessionId: weekRes.activitySessionId,
              name: weekRes.activityName,
              description: weekRes.activityDescription
            })
        }
        acc.push(initialData);
        return acc;
      }
      const lastItem = acc.at(-1);
      // check if it is a new week
      if (weekRes.number !== lastItem.number) {
        const initialData = {
          title: weekRes.title,
          number: weekRes.number,
          days: [{
            name: weekRes.dayName,
            id: weekRes.dayId,
            periods: [{
              id: weekRes.periodId,
              number: weekRes.periodNumber,
              activities: []
            }]
          }]
        }
        if (weekRes.activityId !== null) {
          initialData.days.at(-1).periods.at(-1).push(
            {
              activityId: weekRes.activityId,
              sessionId: weekRes.activitySessionId,
              name: weekRes.activityName,
              description: weekRes.activityDescription
            })
        }
        acc.push(initialData);
        return acc;
      }
      // check if it is a new day
      if (weekRes.dayId !== lastItem.days.at(-1).id) {
        lastItem.days.push({
          name: weekRes.dayName,
          id: weekRes.dayId,
          periods: [{
            id: weekRes.periodId,
            number: weekRes.periodNumber,
            activities: []
          }]
        })
        if (weekRes.activityId !== null) {
          lastItem.days.at(-1).periods.at(-1).push(
            {
              activityId: weekRes.activityId,
              sessionId: weekRes.activitySessionId,
              name: weekRes.activityName,
              description: weekRes.activityDescription
            })
        }
        return acc;
      }

      // check if it is a new period
      if (weekRes.periodId !== lastItem.days.at(-1).periods.at(-1).id) {
        lastItem.days.at(-1).periods.push({
          id: weekRes.periodId,
          number: weekRes.periodNumber,
          activities: []
        })
        if (weekRes.activityId !== null) {
          lastItem.days.at(-1).periods.at(-1).activities.push(
            {
              activityId: weekRes.activityId,
              sessionId: weekRes.activitySessionId,
              name: weekRes.activityName,
              description: weekRes.activityDescription
            })
        }
        return acc;
      }

      // add activity to old period
      if (weekRes.activityId !== null) {
        lastItem.days.at(-1).periods.at(-1).activities.push(
          {
            activityId: weekRes.activityId,
            sessionId: weekRes.activitySessionId,
            name: weekRes.activityName,
            description: weekRes.activityDescription
          })
      }

      return acc;
    }, [])


    // console.log(JSON.stringify(asWeeks, null, 2));
    // return remapped;
    return asWeeks;
  },
  async getAll() {
    const query = `SELECT 
    w.title AS title,
      w.number AS number,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number,
      act.id AS activity_id,
      act.name AS activity_name,
      ases.id AS activity_session_id,
      act.description AS activity_description
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    FULL JOIN activity_sessions ases ON ases.period_id = p.id
    FULL JOIN activities act ON ases.activity_id = act.id
    ORDER BY w.number,d.id,p.period_number
    `;
    const responseData = await fetchMany(query);
    if (!responseData) { return [] }
    const mappedData = this._mapResponse(responseData);
    return mappedData;
  },
  async get(weekNumber) {
    const query = `SELECT 
    w.title AS title,
      w.number AS number,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    WHERE w.number = $1
    `;
    const values = [weekNumber];
    const responseData = await fetchMany(query, values);
    if (!responseData) {
      return false;
    }
    const mappedData = this._mapResponse(responseData);
    return mappedData[0];
  },

  async delete(weekNumber) {
    const query = "DELETE FROM weeks WHERE number = $1 RETURNING *";
    const values = [weekNumber];
    const deletedWeek = await fetchOne(query, values);
    return deletedWeek;
  },
  async create({ title, number }) {
    const weekQuery = `INSERT INTO weeks (title,number) VALUES ($1,$2) RETURNING *`;
    const weekValues = [title, number];
    const insertWeekResponse = await fetchOne(weekQuery, weekValues);
    if (insertWeekResponse) {
      insertWeekResponse.days = [];
    }
    return insertWeekResponse;
  },
};

module.exports = weekRepository;
