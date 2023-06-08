const { param } = require("express-validator");
const Period = require("../../models/period");
const handleValidation = require("../../validation/validationMiddleware");

module.exports = {
	async getAll(req, res, next) {
		let { day } = req.query;
		let periods = await Period.getAll();
		if (day) {
			day = Number.parseInt(day);
			periods = periods.filter((period) => period.dayID === day);
		}
		res.json(periods);
	},
	getActivities: [
		param("periodId").exists().isInt().custom(async (periodId, { req }) => {
			console.log("validating period");
			const period = await Period.get(periodId);
			if (!period) {
				throw new Error("Period does not exist");
			}
			req.period = period
		}),
		handleValidation
		, async (req, res, next) => {
			const period = req.period;
			let activities = await period.getActivities();
			res.json(activities);
		}],
	getOne: [
		param("periodId").exists().isInt().custom(async (periodId, { req }) => {
			console.log("validating period");
			const period = await Period.get(periodId);
			if (!period) {
				throw new Error("Period does not exist");
			}
			req.period = period
		}),
		handleValidation,
		async (req, res, next) => {
			const period = req.period
			res.json(period);
		}],
	getCampers: [
		param("periodId").exists().isInt().custom(async (periodId, { req }) => {
			console.log("validating period");
			const period = await Period.get(periodId);
			if (!period) {
				throw new Error("Period does not exist");
			}
			req.period = period
		}),
		handleValidation,
		async (req, res, next) => {
			const { cabin, assigned } = req.query;
			const { periodId } = req.params;
			const period = req.period
			let campers = await period.getCampers();
			// console.log({campers})
			if (cabin) {
				campers = campers.filter((c) => c.cabinName === cabin);
			}
			if (assigned) {
				if (assigned === "true") {
					campers = campers.filter((c) => c.activityID !== null);
				} else {
					campers = campers.filter((c) => c.activityID === null);
				}
			}
			res.json(campers);
		}],
};
