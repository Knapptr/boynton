const CamperWeek = require("./camperWeek");

const {
	fetchOne,
	fetchOneAndCreate,
	fetchManyAndCreate,
} = require("../utils/pgWrapper");

class Camper {
	constructor({ firstName, lastName, gender, id, age, weeks = undefined }) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.weeks = weeks;
		this.gender = gender;
		this.id = id;
		this.age = age;
	}
	static _parseResults({ first_name, last_name, gender, id, age }) {
		return {
			firstName: first_name,
			lastName: last_name,
			gender,
			id,
			age,
		};
	}
	static async getAll(init = false) {
		const query = "SELECT * FROM campers";
		const campers = await fetchManyAndCreate({ query, Model: Camper });
		if (init) {
			await Promise.all(campers.map((camper) => camper.init()));
		}
		return campers;
	}
	static async getById(id, init = false) {
		const query = "SELECT * FROM campers WHERE id = $1";
		const values = [id];
		const camper = await fetchOneAndCreate({
			query,
			values,
			Model: Camper,
		});
		if (init) {
			await camper.init();
		}
		return camper;
	}
	static async getByArea(area, init) {
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
		if (init) {
			await Promise.all(campers.map((camper) => camper.init()));
		}
		return campers;
	}
	static async getByWeek(weekNumber, area = "none") {
		const query =
			"SELECT * FROM camper_weeks JOIN campers ON campers.id = camper_id WHERE week_id = $1 AND gender = $2";
		const areas = {
			BA: "Male",
			GA: "Female",
			none: "gender",
		};
		const values = [weekNumber, areas[area]];
		const campers = await fetchManyAndCreate({
			query,
			values,
			Model: Camper,
		});
		return campers;
	}
	async init() {
		const weeks = await CamperWeek.getAllCamper(this.id, true);
		this.weeks = weeks;
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
