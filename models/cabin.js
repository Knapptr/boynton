const pool = require("../db/index");
const Camper = require("./camper");
const {
	fetchOneAndCreate,
	fetchManyAndCreate,
	fetchOne,
	fetchMany,
} = require("../utils/pgWrapper");

class Cabin {
	constructor({ name, capacity, area, sessions }) {
		this.name = name;
		this.capacity = capacity;
		this.area = area;
		this.sessions = sessions;
	}
	static _parseResults(dbResponse) {
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
		return new Cabin(Cabin._parseResults(result.rows[0]));
	}
	static async getAll(init = false) {
		const query = "SELECT * from cabins";
		const cabins = await fetchManyAndCreate({
			query,
			Model: Cabin,
		});
		if (init) {
			await Promise.all(cabins.map((cabin) => cabin.init()));
		}
		return cabins;
	}
	static async getAllArea(area) {
		const query = "SELECT * from cabins WHERE area = $1";
		const values = [area];
		const cabins = await fetchManyAndCreate({
			query,
			values,
			Model: Cabin,
		});
		return cabins;
	}
	static async getOne({ name }) {
		const query = "SELECT * from cabins where name = $1";
		const values = [name];
		const cabin = await fetchOneAndCreate({
			query,
			values,
			Model: Cabin,
		});
		return cabin;
	}
	async getAllSessions() {
		const query = "SELECT * from cabin_sessions WHERE cabin_name = $1";
		const values = [this.name];
		let sessions = await fetchMany(query, values);
		sessions = sessions.map((session) => {
			return {};
		});
		return sessions;
	}
	async init() {
		const sessions = await this.getAllSessions();
		this.sessions = sessions || [];
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
		const session = await fetchOne(query, values);
		return session.id;
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

		const campers = await fetchManyAndCreate({
			query,
			values,
			Model: Camper,
		});
		return campers;
	}
	async setSession(weekNumber) {
		const query = "SELECT * from cabin_sessions WHERE week_id = $1";
		const values = [weekNumber];
		const session = await fetchOne(query, values);
		this.session = session.id;
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
