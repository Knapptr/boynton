const { body } = require("express-validator");
const usersHandler = require("../handlers/usersHandler");
const { adminOnly } = require("../middleware/authRole");

const userRouter = require("express").Router();


const selfOrAdminOnly = (req, res, next) => {
	console.log("user:", req.user);
	if (req.user.role === "admin") { next(); return; }
	if (req.params.username !== req.user.username) { res.status(401).send("Not Authorized"); return; }
	next();
}

userRouter.get("/:username", selfOrAdminOnly, usersHandler.get);
userRouter.put("/:username", selfOrAdminOnly, usersHandler.update);
userRouter.get("/:username/schedule/:weekNumber", selfOrAdminOnly, usersHandler.weekSchedule)
userRouter.use(adminOnly);
userRouter.get("/", usersHandler.getAll);
userRouter.post("/", usersHandler.create);
userRouter.delete("/:username", usersHandler.delete);

module.exports = userRouter;
