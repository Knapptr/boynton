const { fetchOne, fetchMany } = require("../utils/pgWrapper");

module.exports = {
  async init() {
    const query = `
    CREATE TABLE IF NOT EXISTS periods
    (
    id serial NOT NULL  ,
    day_id serial NOT NULL  ,
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
      return false;
    }
  },
  _mapResponse(dbResponse) {
    return dbResponse.reduce((acc, cv) => {
      const currentActivity = {
        name: cv.activity_name,
        description: cv.activity_description,
        id: cv.activity_id,
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
    a;
  },

  async getAll() {
    const query = `
  SELECT 
  day_id,period_number,p.id, 
    a.name as activity_name,a.description as activity_description,a.id as activity_id
  FROM periods p 
  LEFT JOIN activities a ON a.period_id = p.id
`;
    const results = await fetchMany(query);
    if (!results) {
      return [];
    }
    const mapped = this._mapResponse(results);
    return mapped;
  },
  async get(id) {
    const query = `SELECT 
  day_id,period_number,p.id, 
    a.name as activity_name,a.description as activity_description,a.id as activity_id
  FROM periods p 
  LEFT JOIN activities a ON a.period_id = p.id
  WHERE p.id = $1
`;
    const values = [id];
    const results = await fetchMany(query, values);
    if (!results) {
      return false;
    }
    return this._mapResponse(results)[0];
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
