const mapManyToOne = require("../utils/remap");
const { fetchMany } = require("../utils/pgWrapper");

class Camper {
	constructor({ firstName, lastName, gender, id, age, weeks = undefined }) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.weeks = weeks;
		this.gender = gender;
		this.id = id;
		this.age = age;
	}
	static _parseResults({
		first_name,
		last_name,
		gender,
		id,
		age,
		week_number,
		week_title,
		camper_week_id,
		cabin_session_id,
		cabin_name,
	}) {
		return {
			gender,
			id,
			age,
			firstName: first_name,
			lastName: last_name,
			weekNumber: week_number,
			weekTitle: week_title,
			camperWeekID: camper_week_id,
			cabinSessionID: cabin_session_id,
			cabinName: cabin_name,
		};
	}
	static async getAll() {
		const query = `
SELECT 

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
LEFT JOIN cabins cab ON cs.cabin_name = cab.name `;
		const dbResponse = await fetchMany(query);
		const parsedResponse = dbResponse.map((response) =>
			Camper._parseResults(response)
		);
		const mappedResponse = mapManyToOne({
			array: parsedResponse,
			identifier: "id",
			newField: "weeks",
			fieldsToMap: [
				"cabinName",
				"cabinSessionID",
				"camperWeekID",
				"weekTitle",
				"weekNumber",
			],
			fieldsToRemain: ["firstName", "lastName", "gender", "age", "id"],
		});
		const campers = mappedResponse.map((c) => new Camper(c));
		return campers;
	}
	static async getById(id) {
		const query = `
SELECT 

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
		//fetchMany is used here because of how the mapping works with mapManyToOne
		const parsedResponse = dbResponse.map((response) =>
			Camper._parseResults(response)
		);
		const mappedResponse = mapManyToOne({
			array: parsedResponse,
			identifier: "id",
			newField: "weeks",
			fieldsToMap: [
				"cabinName",
				"cabinSessionID",
				"camperWeekID",
				"weekTitle",
				"weekNumber",
			],
			fieldsToRemain: ["firstName", "lastName", "gender", "age", "id"],
		});
		const campers = mappedResponse.map((c) => new Camper(c));

		return campers[0];
	}
}

module.exports = Camper;
