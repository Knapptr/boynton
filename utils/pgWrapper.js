const pool = require("../db/index");

const helpers = {
	async fetchOne(query, values) {
		const results = await pool.query(query, values);
		if (results.rows.length === 0) {
			return false;
		}
		return results.rows[0];
	},
	async fetchOneAndCreate({ query, values, Model }) {
		const results = await pool.query(query, values);
		if (results.rows.length === 0) {
			return false;
		}
		const item = results.rows[0];
		return new Model(Model._parseResults(item));
	},
	async fetchMany(query, values) {
		const results = await pool.query(query, values);
		if (results.rows.length === 0) {
			return false;
		}
		return results.rows;
	},
	async fetchManyAndCreate({ query, values, Model, session }) {
		const results = await pool.query(query, values);
		if (results.rows.length === 0) {
			return false;
		}
		const items = results.rows;
		const instances = items.map(
			(item) => new Model(Model._parseResults(item))
		);
		if (!session) {
			return instances;
		}
		await Promise.all(instances.map((i) => i.setSession(session)));
		return instances;
	},
};

module.exports = helpers;
