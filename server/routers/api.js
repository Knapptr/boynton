const router = require("express").Router();
const activityRouter = require("./activity");
const camperRouter = require("./campers");
const periodRouter = require("./period");
const daysRouter = require("./days");
const cabinSessionRouter = require("./cabinSession");
const cabinRouter = require("./cabins");
const camperWeekRouter = require("./camperWeeks");
const weekRouter = require("./weeks");
const scoreRouter = require('./scores');
const passport = require("passport");
const activitySessionRouter = require("./activitySession");
const camperActivityRouter = require("./camperActivity");
const usersRouter = require("./users");
const staffSessionRouter = require("./staffSessions");

const errorHandling = (err, req, res, next) => {
	if (err.type) {
		switch (err.type) {
			case "API":
				res.status(err.status).json(err);
				break;
			case "DB":
				res.status(400).send(err.message);

		}
	}
}
router.use(passport.authenticate("jwt", { session: false }));
//log all api requs
router.use((req, res, next) => {
	console.log(`${req.method} Request to: ${req.url}. Params:`, req.params, "Query:", req.query, "User", req.user);
	next()
})
router.use('/scores', scoreRouter);
router.use("/activities", activityRouter);
router.use("/activity-sessions", activitySessionRouter);
router.use("/campers", camperRouter);
router.use("/camper-activities", camperActivityRouter);
router.use("/periods", periodRouter);
router.use("/staff-sessions", staffSessionRouter);
router.use("/days", daysRouter);
router.use("/cabin-sessions", cabinSessionRouter);
router.use("/cabins", cabinRouter);
router.use("/camper-weeks", camperWeekRouter);
router.use("/weeks", weekRouter);
router.use("/users", usersRouter);
router.use(errorHandling)

module.exports = router;
