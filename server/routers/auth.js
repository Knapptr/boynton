const { login, create } = require("../handlers/login");
const passport = require("passport");

const authRouter = require("express").Router();

authRouter.post("/login", login);
authRouter.post("/create/:signUpToken", create)
authRouter.get(
	"/protected",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);
authRouter.use((err, req, res, next) => {
	if (err.type) {
		switch (err.type) {
			case "API":
				if (err.reason === "VALIDATION") {
					res.status(err.status).json(err.errors);
					return;
				}
				res.status(err.status).json(err);
				break;
			case "DB":
				res.status(400).send(err.message);

		}
	} else {
		console.log("Unhandleable error. Sending 500");
		console.log({ err });
		res.status(500).send("Server Error");
	}
})

module.exports = authRouter;
