const router = require("express").Router();
const Week = require("../../models/week");
const Period = require("../../models/period");
const Day = require("../../models/day");
const error = require("../../utils/jsonError");

router.get("/", async (req, res) => {
	const weeks = await Week.getAll();
	res.json(weeks);
});
router.get("/:number(\\d+)/campers", async (req, res) => {
	const weekID = req.params.number;
	const week = await Week.get(weekID);
	const campers = await week.getCampers();
	res.json(campers);
});
router.get("/:number(\\d+)/periods", async (req, res) => {
	const weekID = req.params.number;
	const periods = await Period.getForWeek(weekID);
	res.json(periods);
});
router.get("/:number(\\d+)/periods/:day", async (req, res) => {
	const allowedDays = ["MON", "TUE", "WED", "THU", "FRI"];
	const weekID = req.params.number;
	const dayName = req.params.day.toUpperCase();
	if (!allowedDays.includes(dayName)) {
		res.json(error("Days are 3 letters, eg: MON, TUE etc"));
		return;
	}
	const day = await Day.getByWeekAndName(weekID, dayName);
	const periods = await Period.getForDay(day.id);
	res.json(periods);
});
router.get("/:number(\\d+)", async (req, res) => {
	const weekID = req.params.number;
	const week = await Week.get(weekID);
	res.json(week);
});

module.exports = router;
