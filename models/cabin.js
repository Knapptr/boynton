const pool = require("../db/index");
const Camper = require("./camper");

class Cabin {
	constructor({ name, capacity, area }) {
		this.name = name;
		this.capacity = capacity;
		this.area = area;
	}
	static _parseResponse(dbResponse) {
		return {
			name: dbResponse.name,
			capacity: dbResponse.capacity,
			area: dbResponse.area,
		};
	}
	static async create({ name, capacity, area }) {
		//check if it exists
		const testResult = await Cabin.getOne({ name });
		if (testResult) {
			throw new Error("Cannot add cabin: cabin already exists");
		}

		const query =
			"INSERT INTO cabins (name,capacity,area) VALUES ($1,$2,$3) returning *";
		const values = [name, capacity, area];
		const result = await pool.query(query, values);
		return new Cabin(Cabin._parseResponse(result.rows[0]));
	}
	static async getAll() {
		const query = "SELECT * from cabins";
		const results = pool.query(query);
		const cabins = results.rows.map(
			(cabin) => new Cabin({ name: cabin.name, capacity: cabin.capacity })
		);
		return cabins;
	}
	static async getAllArea(area) {
		const query = "SELECT * from cabins WHERE area = $1";
		const values = [area];
		const results = await pool.query(query, values);
		const cabins = results.rows.map(
			(cabin) =>
				new Cabin({
					name: cabin.name,
					capacity: cabin.capacity,
					area: cabin.area,
				})
		);
		return cabins;
	}
	static async getOne({ name }) {
		try {
			const query = "SELECT * from cabins where name = $1";
			const values = [name];
			const results = await pool.query(query, values);
			if (results.rows.length === 0) {
				return false;
			}
			const cabin = results.rows[0];
			return new Cabin(Cabin._parseResponse(cabin));
		} catch (e) {
			throw new Error(`Error getting one cabin: ${e}`);
		}
	}
	async createSession(weekID) {
		const query =
			"INSERT INTO cabin_sessions (week_id,cabin_name) VALUES ($1,$2) returning id";
		const values = [weekID, this.name];
		const result = await pool.query(query, values);
		const id = result.rows[0].id;
		return id;
	}
	async getSession(weekID) {
		const query =
			"SELECT id  from cabin_sessions WHERE week_id = $1 AND cabin_name= $2";
		const values = [weekID, this.name];
		const result = await pool.query(query, values);
		if (result.rows.length === 0) {
			return false;
		}
		const id = result.rows[0].id;
		return id;
	}
	async addCampers({ campers, weekID }) {
		// get session ID
		let sessionID = await this.getSession(weekID);
		// create if no session exists
		if (!sessionID) {
			sessionID = await this.createSession(weekID);
		}
		//campers is an array of camper IDs
		const query =
			"INSERT INTO camper_cabin_sessions (cabin_session_id,camper_id) VALUES ($1,$2) RETURNING id";
		const ids = [];
		for (let camperID of campers) {
			const values = [sessionID, camperID];
			const result = await pool.query(query, values);
			const id = result.rows[0].id;
			ids.push(id);
		}
		return ids;
	}
	async getCampers({ weekID }) {
		const query = `SELECT cabin_session_id, camper_id,week_id,cabin_name,first_name,last_name,gender,age,sessions,campers.id as id FROM camper_cabin_sessions 
JOIN cabin_sessions 
ON cabin_sessions.id = camper_cabin_sessions.cabin_session_id
JOIN campers
ON campers.id = camper_cabin_sessions.camper_id
WHERE cabin_sessions.cabin_name = $1 AND cabin_sessions.week_id = $2`;

		const values = [this.name, weekID];
		const results = await pool.query(query, values);
		const campers = results.rows.map((camper) => {
			return new Camper({
				firstName: camper.first_name,
				age: camper.age,
				lastName: camper.last_name,
				id: camper.id,
				gender: camper.gender,
				sessions: camper.sessions,
			});
		});
		return campers;
	}
}

module.exports = Cabin;

//test
// (async () => {
// 	try {
// const cabin = await Cabin.create({
// 	name: "8",
// 	capacity: 6,
// 	area: "BA",
// });
// const cabin = await Cabin.getOne({ name: "8" });
// console.log(cabin);
// const added = await cabin.addCampers({
// 	campers: [1416, 1374],
// 	weekID: 1,
// });
// const campers = await cabin.getCampers({ weekID: 1 });
// console.log(campers);
// } catch (e) {
// console.log(e);
// }
// })();
