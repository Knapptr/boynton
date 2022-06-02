const User = require("../models/User");

const validate = async (username, password) => {
	try {
		const userInDb = await User.get(username);
		const { isAuthenticated, user } = await User.authenticate(
			username,
			password
		);
		console.log({ isAuthenticated, user });
		if (isAuthenticated) {
			return user;
		}
		return false;
	} catch (e) {}
};

module.exports = validate;
