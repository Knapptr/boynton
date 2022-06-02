const { login } = require("../handlers/login");
const passport = require("passport");

const authRouter = require("express").Router();

authRouter.post("/login", login);
authRouter.get(
	"/protected",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);
module.exports = authRouter;
