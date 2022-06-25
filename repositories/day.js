const { fetchOne, fetchMany } = require("../utils/pgWrapper");

module.exports = {
  async init() {
    const query = `
    CREATE TABLE IF NOT EXISTS days
    (
    name character varying(3) COLLATE pg_catalog."default",
    id serial NOT NULL,
    week_id serial NOT NULL ,
    CONSTRAINT day_pkey PRIMARY KEY (id),
    CONSTRAINT week_id_name FOREIGN KEY (week_id)
    REFERENCES weeks ("number") MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE
    NOT VALID
    )`;
    try {
      await fetchMany(query);
      return true;
    } catch (e) {
      throw new Error(`Cannot init with query: ${query})
    }
  },

  async getAll() {
    const query = "SELECT * from days";
    const response = await fetchMany(query);
    if (!response) {
      return [];
    }
    return response.map((d) => ({
      name: d.name,
      id: d.id,
      weekNumber: d.week_id,
    }));
  },
  async getOne(id) {
    const query = "SELECT * from days WHERE id = $1";
    const values = [id];
    const result = await fetchOne(query, values);
    if (!result) {
      return false;
    }
    return {
      id: result.id,
      name: result.name,
      weekNumber: result.week_id,
    };
  },
  async create({ name, weekNumber }) {
    const query = "INSERT INTO days (name,week_id) VALUES ($1,$2)";
    const values = [name, weekNumber];
    const result = await fetchOne(query, values);
    if (!result) {
      return false;
    }
    return {
      id: result.id,
      name: result.name,
      weekNumber: result.week_id,
    };
  },
};
