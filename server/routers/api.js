const router = require("express").Router();
const activityRouter = require("./activity");
const camperRouter = require("./campers");
const periodRouter = require("./period");
const daysRouter = require("./days");
const cabinSessionRouter = require("./cabinSession");
const cabinRouter = require("./cabins");
const camperWeekRouter = require("./camperWeeks");
const weekRouter = require("./weeks");
const passport = require("passport");

router.use(passport.authenticate("jwt", { session: false }));
router.use("/activities", activityRouter);
router.use("/campers", camperRouter);
router.use("/periods", periodRouter);
router.use("/days", daysRouter);
router.use("/cabin-sessions", cabinSessionRouter);
router.use("/cabins", cabinRouter);
router.use("/camper-weeks", camperWeekRouter);
router.use("/weeks", weekRouter);

module.exports = router;
