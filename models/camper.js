const pool = require('../db');
const defaultCamperRepository = require('../repositories/camper');

class Camper {
	constructor({ firstName, lastName, gender, id, age, weeks = undefined }, camperRepository = defaultCamperRepository) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.weeks = weeks;
		this.gender = gender;
		this.id = id;
		this.age = age;
		this.camperRepository = camperRepository
	}
	toJSON() {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			age: this.age,
			gender: this.gender,
			weeks: this.weeks,
		}
	}
	static async getByWeek(weekNumber) {
		const query = `
	  SELECT
camp.first_name,
camp.last_name,
camp.age,
camp.id as camper_id,
gender as gender,
cw.cabin_session_id as cabin_session_id,
cw.id as camper_session_id,
cabin.name AS cabin_assignment
from campers camp
JOIN camper_weeks cw ON cw.camper_id = camp.id
LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
LEFT JOIN cabins cabin ON cabin.name = cs.cabin_name
WHERE cw.week_id = $1
ORDER BY camp.last_name, camp.first_name, camp.age
	  `
		const values = [weekNumber];

		const results = await pool.query(query, values);
		// TODO error handling
		return results.rows.map(r => ({
			firstName: r.first_name,
			lastName: r.last_name,
			age: r.age,
			gender: r.gender,
			pronouns: r.pronouns,
			cabinSessionId: r.cabin_session_id,
			cabinAssignment: r.cabin_assignment,
			sessionId: r.camper_session_id,
			camperId: r.camper_id
		}))
	}
	async save() {
		const response = await this.camperRepository.create({
			firstName: this.firstName,
			lastName: this.lastName,
			age: this.age,
			gender: this.gender,
			id: this.id,
		})
		return response;
	}
	static async getAll(camperRepository = defaultCamperRepository) {
		const response = await camperRepository.getAll();
		return response.map(c => new Camper(c))
		// const query = `
	}
	static async getById(id, camperRepository = defaultCamperRepository) {
		const response = await camperRepository.getOne(id)
		if (!response) { return false }
		return new Camper(response);

	}
}

module.exports = Camper;
