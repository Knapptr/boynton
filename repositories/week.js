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
  _mapResponse(dbResponse) {
    const camelCased = dbResponse.map((w) => camelCaseProps(w));
    const remappedWithDays = mapToGroups(camelCased, "number", "days", {
      dayName: "name",
      dayId: "id",
      periodId: "periodId",
      periodNumber: "periodNumber",
    });
    const remapped = remappedWithDays.map((w) => {
      return {
        ...w,
        days: mapToGroups(w.days, "id", "periods", {
          periodNumber: "number",
          periodId: "id",
        }),
      };
    });
    return remapped;
  },
  async getAll() {
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
    `;
    const responseData = await fetchMany(query);
      if(!responseData){return []}
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
