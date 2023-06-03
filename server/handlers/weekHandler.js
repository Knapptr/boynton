const Week = require("../../models/week");
const Period = require("../../models/period");
const Day = require("../../models/day");
const Camper = require("../../models/camper");
const error = require("../../utils/jsonError");

const weekHandler = {
	async getAll(req, res, next) {
		const getStaff = req.query.staff === "true";
		const weeks = await Week.getAll(getStaff);
		res.json(weeks);
	},
	async getOne(req, res, next) {
		const getStaff = req.query.staff === "true";
		const weeks = await Week.getAll(getStaff);
		const weekID = req.params.weekNumber;
		const week = await Week.get(weekID, getStaff);
		res.json(week);
	},
	async getWeekCampers(req, res, next) {
		const weekID = req.params.number;
		const week = await Week.get(weekID);
		const campers = await week.getCampers(true);

		res.json(campers);
	},
	async getWeekPeriods(req, res, next) {
		const weekID = req.params.number;
		const periods = await Period.getForWeek(weekID);
		res.json(periods);
	},
	async getDayPeriods(req, res, next) {
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
	},
	async getPeriodActivities(req, res, next) {
		const periodID = req.params.periodID;
		const period = await Period.get(periodID);
		if (!period) {
			res.json(error(`Period does not exist: ${periodID}`));
			return;
		}
		const activities = await period.getActivities();
		res.json(activities);
	},
	async getUnsignedCampers(req, res, next) {
		const weekID = req.params.number;
		const periodID = req.params.periodID;
		const period = await Period.get(periodID);
		const campers = await period.getUnSignedUpCampers(weekID);
		res.json(campers);
	},
	async getSignedCampers(req, res, next) {
		const weekID = req.params.number;
		const periodID = req.params.periodID;
		const period = await Period.get(periodID);
		const campers = await period.getSignedUpCampers(weekID);
		res.json(campers);
	},
	async getUnsignedByCabin(req, res, next) {
		const weekID = req.params.number;
		const periodID = req.params.periodID;
		const period = await Period.get(periodID);
		const campers = await period.getUnSignedUpCampers(weekID, cabin);
		res.json(campers);
	},
};

module.exports = weekHandler;
