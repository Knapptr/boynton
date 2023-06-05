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
					lifeguard bool NOT NULL DEFAULT false,
					archery bool NOT NULL DEFAULT false,
					senior bool NOT NULL DEFAULT false,
					first_year bool NOT NULL DEFAULT false,
					ropes bool NOT NULL DEFAULT false,
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
		const query = `
		SELECT u.*, ss.week_number as week_number, ss.id as staff_session_id from users u
		LEFT JOIN staff_sessions ss ON ss.username = u.username
		WHERE u.username = $1
		`;
		const values = [username];
		const userResponse = await fetchMany(query, values);
		if (!userResponse) {
			return false;
		}


		const initUser = {
			username: "",
			password: "",
			firstName: "",
			lastName: "",
			role: "counselor",
			senior: false,
			firstYear: false,
			lifeguard: false,
			archery: false,
			ropes: false,
			sessions: []
		}

		const user = userResponse.reduce((mappedUser, db) => {
			mappedUser.username = db.username;
			mappedUser.password = db.password;
			mappedUser.firstName = db.first_name;
			mappedUser.lastName = db.last_name;
			mappedUser.role = db.role;
			mappedUser.senior = db.senior;
			mappedUser.firstYear = db.first_year;
			mappedUser.lifeguard = db.lifeguard;
			mappedUser.archery = db.archery;
			mappedUser.ropes = db.ropes

			if (db.staff_session_id !== null) {
				mappedUser.sessions.push(
					{
						id: db.staff_session_id,
						weekNumber: db.week_number
					}
				)
			}
			return mappedUser
		}, initUser)


		return user;
	},
	async create({ username, password: unhashedPassword, role, firstName, lastName, lifeguard = false, archery = false, ropes = false, firstYear = false, senior = false }) {
		try {
			const encryptedPassword = await encrypt(unhashedPassword);
			const query =
				"INSERT INTO users (username,password,role,first_name,last_name,lifeguard,archery,ropes,first_year,senior) VALUES ($1,$2,$3,$4,$5, $6, $7, $8, $9, $10) RETURNING * ";
			const values = [
				username,
				encryptedPassword,
				role,
				firstName,
				lastName,
				lifeguard,
				archery,
				ropes,
				firstYear,
				senior
			];
			const createdUser = await fetchOne(query, values);
			const user = { username: createdUser.username, password: createdUser.password, firstName: createdUser.first_name, lastName: createdUser.last_name, role: createdUser.role }
			const staffing = { lifeguard: createdUser.lifeguard, archery: createdUser.archery, ropes: createdUser.archery, firstYear: createdUser.first_year, senior: createdUser.senior }
			user.staffing = staffing;

			return user;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
	async delete() {
		try {
			const query =
				"DELETE FROM users WHERE username = $1 RETURNING username,role";
			const values = [this.username];
			const deletedUser = await fetchOne(query, values);
			return deletedUser;
		} catch (error) {
			return false;
		}
	},

	/** Assign a user to an activity
	* @param activitySession the activity session to schedule the staff member */
	async assignToActivity(activitySession) {
		const query = "INSERT INTO user_activities (username, activity_session_id) VALUES ($1,$2) RETURNING *"
		const values = [this.username, activitySession.id];
		try {
			const result = await fetchOne(query, values);
			if (!result) { return false }
		} catch (e) {
			console.log("Error");
			console.log(e);
			return false
		}
	}
};
module.exports = UserRepository;
