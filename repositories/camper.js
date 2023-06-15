const { mapToGroups } = require("../utils/aggregation");
const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const { camelCaseProps } = require("../utils/cases");

module.exports = {
	async init() {
		const query = `
			CREATE TABLE IF NOT EXISTS campers (
			first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
			last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
			id integer NOT NULL,
			pronouns character varying(255),
			gender character varying(255) COLLATE pg_catalog."default",
			age integer,
			CONSTRAINT camper_pkey PRIMARY KEY (id)
			)
  `;
		try {
			await fetchOne(query);
			return true;
		} catch (e) {
			console.log(e);
			throw new Error(`Cannot init with query: ${query}`)
		}
	},
	_mapResponse(dbResponse) {
		const camelCased = dbResponse.map((c) => camelCaseProps(c));
		return mapToGroups(camelCased, "id", "weeks", {
			weekNumber: "number",
			weekTitle: "title",
			cabinName: "cabinName",
			cabinSessionId: "cabinSessionId",
			camperWeekId: "id",
			dayCamp: "dayCamp"
		});
	},
	async getAll() {
		const query = `SELECT 
     c.first_name,
     c.last_name ,
     c.gender,c.id,c.age,
     w.number AS week_number, w.title AS week_title,
     cw.id AS camper_week_id,
     cw.day_camp,
     cw.cabin_session_id AS cabin_session_id,
     cab.name AS cabin_name
     FROM campers c
     JOIN camper_weeks cw ON cw.camper_id = c.id
     JOIN weeks w ON cw.week_id = w.number
     LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id 
     LEFT JOIN cabins cab ON cs.cabin_name = cab.name `;
		const dbResponse = await fetchMany(query);
		const mappedResponse = this._mapResponse(dbResponse);
		return mappedResponse;
	},
	async getOne(id) {
		const query = `SELECT 
     c.first_name,
     c.last_name ,
     c.gender,c.id,c.age,
     w.number AS week_number, w.title AS week_title,
     cw.id AS camper_week_id,
     cw.cabin_session_id AS cabin_session_id,
     cab.name AS cabin_name
     FROM campers c
     JOIN camper_weeks cw ON cw.camper_id = c.id
     JOIN weeks w ON cw.week_id = w.number
     LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id 
     LEFT JOIN cabins cab ON cs.cabin_name = cab.name 
     WHERE c.id = $1
    `;
		const values = [id];
		const dbResponse = await fetchMany(query, values);
		if (!dbResponse) {
			return false;
		}
		const mappedResponse = this._mapResponse(dbResponse);
		return mappedResponse[0];
	},
	async create({ firstName, lastName, age, gender, id }) {
		const query = `
      INSERT INTO campers (id,first_name,last_name,age,gender)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT ON CONSTRAINT camper_pkey
      DO UPDATE
      SET 
      first_name = $2,
      last_name = $3,
      age = $4,
      RETURNING *
    `;
		const values = [id, firstName, lastName, age, gender];
		const result = await fetchOne(query, values);
		if (!result) {
			return false;
		}
		return {
			firstName: result.first_name,
			lastName: result.last_name,
			age: result.age,
			gender: result.gender,
			weeks: [],
		};
	},
};
