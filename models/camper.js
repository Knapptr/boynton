const pool = require("../db/index");
const { fetchOne, fetchManyAndCreate } = require("../utils/pgWrapper");

class Camper {
	constructor({ firstName, lastName, gender, id, sessions, age }) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.sessions = sessions;
		this.gender = gender;
		this.id = id;
		this.age = age;
	}
	static _parseResults({ first_name, last_name, gender, id, sessions, age }) {
		return {
			firstName: first_name,
			lastName: last_name,
			gender,
			id,
			sessions,
			age,
		};
	}
	static async getAll() {
		const query = "SELECT * FROM campers";
		const campers = await fetchManyAndCreate({ query, Model: Camper });
		return campers;
	}
	static async getById(id) {
		const query = "SELECT * FROM campers WHERE id = $1";
		const values = [id];
		const camper = await fetchOneAndCreate({
			query,
			values,
			Model: Camper,
		});
		return camper;
	}
	static async getByArea(area) {
		area = area.toUpperCase();
		if (area !== "GA" && area !== "BA") {
			console.log("Non BA or GA ara requested");
			return false;
		}
		const gender = { BA: "Male", GA: "Female" }[area];
		const query = "SELECT * from campers WHERE gender = $1";
		const values = [gender];
		const campers = await fetchManyAndCreate({
			query,
			values,
			Model: Camper,
		});
		return campers;
	}
	get fullName() {
		return `${this.firstName} ${this.lastName}`;
	}
}

//tests
// (async () => {
// 	// const campers = await Camper.getAll();
// 	const campers = await Camper.getByFullName({
// 		firstName: "Solomon",
// 		lastName: "Blorn",
// 	});
// 	console.log(campers.fullName);
// })();

module.exports = Camper;
