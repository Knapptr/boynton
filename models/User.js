const encrypt = require("../utils/encryptPassword");
const compare = require("../utils/comparePassword");
const { fetchOne } = require("../utils/pgWrapper");

module.exports = class User {
	constructor(username, password, role) {
		(this.username = username),
			(this.password = password),
			(this.role = role);
	}

	static async get(username) {
		const query = "SELECT * from users WHERE username = $1";
		const values = [username];
		const user = await fetchOne(query, values);
		if (!user) {
			return false;
		}
		return new User(user.username, user.password, user.role);
	}
	static async create(username, password, role) {
		const encryptedPassword = await encrypt(password);
		const query =
			"INSERT INTO users (username,password,role) VALUES ($1,$2,$3) RETURNING * ";
		const values = [username, encryptedPassword, role];
		const createdUser = await fetchOne(query, values);
		return new User(
			createdUser.username,
			createdUser.password,
			createdUser.role
		);
	}
	static async authenticate(username, password) {
		const user = await User.get(username);
		console.log({ user });
		if (!user) {
			return false;
		}
		const isAuthenticated = await compare(password, user.password);
		return { user, isAuthenticated };
	}
};
