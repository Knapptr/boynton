const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const encrypt = require("../utils/encryptPassword");
const User = require("../models/User");

const UserRepository = {
	async init() {
		const query = `
			CREATE TABLE IF NOT EXISTS users
			(
					username character varying(24) NOT NULL,
					password character varying(255) NOT NULL,
					first_name character varying(255) NOT NULL,
					last_name character varying(255) NOT NULL,
					role character varying(255) NOT NULL DEFAULT 'counselor'::character varying,
					CONSTRAINT users_pkey PRIMARY KEY (username)
			)`;

		const getAllQuery = ` SELECT username from users `;

		try {
			await fetchOne(query);
			const allUsers = await fetchMany(getAllQuery);

			if (!allUsers) {
				const initAdminQuery = `
				  INSERT INTO users 
				  (username, password, first_name, last_name, role)
				  VALUES ($1,$2,$3,$4,$5) `
				const hashedPassword = await encrypt(process.env.DEFAULT_ADMIN_PASSWORD);
				const username = process.env.DEFAULT_ADMIN_USERNAME;
				const firstName = "Default Admin";
				const lastName = "Account";
				const values = [username, hashedPassword, firstName, lastName, "admin"];

				await fetchMany(initAdminQuery, values);
			}

			return true;

		} catch (e) {
			throw new Error(`Cannot init with query: ${query},${e}`)
		}
	},
	async get(username) {
		const query = "SELECT * from users WHERE username = $1";
		const values = [username];
		const user = await fetchOne(query, values);
		if (!user) {
			return false;
		}
		return user;
	},
	async create({ username, password: unhashedPassword, role, firstName, lastName }) {
		try {
			const encryptedPassword = await encrypt(unhashedPassword);
			const query =
				"INSERT INTO users (username,password,role,first_name,last_name) VALUES ($1,$2,$3,$4,$5) RETURNING * ";
			const values = [username, encryptedPassword, role, firstName, lastName];
			const createdUser = await fetchOne(query, values);
			return createdUser;
		} catch (error) {
			return false;
		}
	},
	async delete(username) {
		try {
			const query =
				"DELETE FROM users WHERE username = $1 RETURNING username,role";
			const values = [username];
			const deletedUser = await fetchOne(query, values);
			return deletedUser;
		} catch (error) {
			return false;
		}
	},
};
module.exports = UserRepository;
