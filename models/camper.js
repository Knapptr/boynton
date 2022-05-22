const pool = require("../db/index");

class Camper {
	constructor({ firstName, lastName, gender, id, sessions }) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.sessions = sessions;
	}
	static _parseResults({ first_name, last_name, gender, id, sessions }) {
		return {
			firstName: first_name,
			lastName: last_name,
			gender,
			id,
			sessions,
		};
	}
	static async getAll() {
		const results = await pool.query("select * from campers;");
		const camperResults = results.rows;
		const campers = camperResults.map((camper) => {
			return new Camper(Camper._parseResults(camper));
		});
		return campers;
	}
	static async getById(id) {
		const results = await pool.query(
			"SELECT * from campers where id = $1",
			[id]
		);
		const camperResult = results.rows[0];
		return new Camper(Camper._parseResults(camperResult));
	}
	static async getByFullName({ firstName, lastName }) {
		try {
			const results = await pool.query(
				"SELECT * FROM campers WHERE first_name = $1 AND last_name = $2",
				[firstName, lastName]
			);
			return new Camper(Camper._parseResults(results.rows[0]));
		} catch (e) {
			throw new Error("Error getting Camper");
		}
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
