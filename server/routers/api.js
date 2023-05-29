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
const { adminOnly } = require("../middleware/authRole");

//log all api requs
router.use((req, res, next) => {
	console.log(`Request to: ${req.url}. Params:`, req.params, "Query:", req.query);
	next()
})
router.use('/scores', scoreRouter);
router.use(passport.authenticate("jwt", { session: false }));
router.use("/activities", activityRouter);
router.use("/activity-sessions", activitySessionRouter);
router.use("/campers", camperRouter);
router.use("/camper-activities", camperActivityRouter);
router.use("/periods", periodRouter);
router.use("/days", daysRouter);
router.use("/cabin-sessions", cabinSessionRouter);
router.use("/cabins", cabinRouter);
router.use("/camper-weeks", camperWeekRouter);
router.use("/weeks", weekRouter);
router.use(adminOnly);
router.use("/users", usersRouter);
module.exports = router;
