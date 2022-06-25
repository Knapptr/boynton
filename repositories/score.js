const { fetchMany, fetchOne } = require("../utils/pgWrapper");
const { formatmmddyyyy } = require("../utils/getDates");

module.exports = {
  async init() {
    const query = `
      CREATE TABLE IF NOT EXISTS  scores
      (
      points integer NOT NULL,
      id serial NOT NULL,
      awarded_to character varying(1) NOT NULL,
      awarded_for character varying(255) NOT NULL,
      awarded_at date NOT NULL,
      week_number integer,
      PRIMARY KEY (id),
      CONSTRAINT week_number FOREIGN KEY (week_number)
      REFERENCES weeks ("number") MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE SET NULL
      NOT VALID
      )
`;
    try {
      await fetchMany(query);
      return true;
    } catch (e) {
      return false;
    }
  },
  _mapResponse(dbResponse) {
    return {
      id: dbResponse.id,
      awardedAt: dbResponse.awarded_at,
      awardedTo: dbResponse.awarded_to,
      points: dbResponse.points,
      awardedFor: dbResponse.awarded_for,
      weekNumber: dbResponse.week_number,
    };
  },
  async getAll() {
    const query = `
      SELECT * FROM scores
    `;
    const dbResponse = await fetchMany(query);
    if (!dbResponse) {
      return false;
    }
    return dbResponse.map(this._mapResponse);
  },
  async create({ awardedTo, points, awardedFor, weekNumber }) {
    const query =
      "INSERT INTO scores (awarded_to,points,awarded_for,week_number,awarded_at) VALUES ($1, $2, $3, $4,$5) RETURNING *; ";
    const awardedAt = formatmmddyyyy(new Date());
    const values = [awardedTo, points, awardedFor, weekNumber, awardedAt];
    const result = await fetchOne(query, values);
    return this._mapResponse(result);
  },
};
