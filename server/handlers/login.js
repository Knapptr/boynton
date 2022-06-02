const authenticate = require("../../utils/authenticate");
const error = require("../../utils/jsonError");
const jwt = require("jsonwebtoken");
module.exports = {
	async login(req, res) {
		const { username, password } = req.body;
		if (!username || !password) {
			res.json(error("No username or password"));
			return;
		}
		const isAuthenticated = await authenticate(username, password);
		console.log({ isAuthenticated });
		if (!isAuthenticated) {
			res.status(401);
			res.json(error("Not authorized"));
			return;
		}
		//give json token
		const token = await jwt.sign(
			{ userName: isAuthenticated.username },
			process.env.JWT_SECRET
		);
		res.json({ token });
	},
};
