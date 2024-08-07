const router = require("express").Router();
const activityRouter = require("./activity");
const commentRouter = require("./camperCommentRouter.js");
const camperRouter = require("./campers");
const periodRouter = require("./period");
const configRouter = require("./config");
const daysRouter = require("./days");
const cabinSessionRouter = require("./cabinSession");
const scheduleRouter = require("./scheduleRouter");
const cabinRouter = require("./cabins");
const camperWeekRouter = require("./camperWeeks");
const weekRouter = require("./weeks");
const scoreRouter = require('./scores');
const passport = require("passport");
const activitySessionRouter = require("./activitySession");
const camperActivityRouter = require("./camperActivity");
const signUpTokenRouter = require("./signUpToken");
const usersRouter = require("./users");
const staffSessionRouter = require("./staffSessions");
const programAreaRouter = require("./programAreas");
const awardsRouter = require("./awards");
const { adminOnly } = require("../middleware/authRole");
const { default: ActivityLocationRouter } = require("./activityLocations.js");
const activityLocationRouter = require("./activityLocations.js");

router.use(passport.authenticate("jwt", { session: false }));
//log all api requs
router.use((req, res, next) => {
	console.log(`${req.method} Request to: ${req.url}. Params:`, req.params, "Query:", req.query, "Body:", req.body, "User", { username: req.user.username, first: req.user.firstName, last: req.user.lastName });
	next()
})
router.use("/sign-up-token", signUpTokenRouter);
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
router.use("/program-areas", programAreaRouter);
router.use("/awards", awardsRouter);
router.use("/camper-comment", commentRouter);
router.use("/schedule",scheduleRouter);
router.use("/activity-locations",activityLocationRouter);

// Admin Only Routes
router.use(adminOnly);
router.use("/config", configRouter);

// Error handling
router.use((err, req, res, next) => {
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

module.exports = router;
