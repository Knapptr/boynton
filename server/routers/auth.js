const { login,create } = require("../handlers/login");
const passport = require("passport");

const authRouter = require("express").Router();

authRouter.post("/login", login);
authRouter.post("/create",create)
authRouter.get(
	"/protected",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);
module.exports = authRouter;
