const { login } = require("../handlers/login");

const authRouter = require("express").Router();

authRouter.post("/login", login);
authRouter.get("/", (req, res) => {
	res.send("working");
});
module.exports = authRouter;
