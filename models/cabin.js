const pool = require("../db/index");
const Camper = require("./camper");

class Cabin {
	constructor({ name, capacity }) {
		this.name = name;
		this.capacity = capacity;
	}
	static async getAll() {
		const query = "SELECT * from cabins";
		const results = pool.query(query);
		const cabins = results.rows.map(
			(cabin) => new Cabin({ name: cabin.name, capacity: cabin.capacity })
		);
		return cabins;
	}
	static async getOne({ id, name }) {
		try {
			if (id) {
				const query = "SELECT * from cabins where id = $1";
				const values = [id];
				const results = await pool.query(query, values);
				const cabin = results.rows[0];
				return new Cabin({ name: cabin.name, capcity: cabin.capacity });
			}
			if (name) {
				const query = "SELECT * from cabins where name = $1";
				const values = [name];
				const results = await pool.query(query, values);
				const cabin = results.rows[0];
				return new Cabin({
					name: cabin.name,
					capacity: cabin.capacity,
				});
			}
		} catch (e) {
			throw new Error(`Error getting one cabin: ${e}`);
		}
	}
	getCampers({ weekID }) {
		const query =
			"SELECT * FROM camper_cabin_sessions JOIN campers on camper_cabin_sessions.id = campers.id WHERE camper_cabin_sessions.week_id = $1";
		const values = [weekID];
		const results = pool.query(query, values);
		const campers = results.rows.map(
			(camper) =>
				new Camper({
					firstName: camper.first_name,
					age: camper.age,
					lastName: camper.last_name,
					id: camper.id,
					gender: camper.gender,
					sessions: camper.sessions,
				})
		);
		return campers;
	}
}
