const { param, body } = require("express-validator");
const CabinSession = require("../../models/cabinSession");
const CamperWeek = require("../../models/camperWeek");
const handleValidation = require("../../validation/validationMiddleware");
const areas = { ba: "Male", ga: "Female" };
module.exports = {
	async getAll(req, res, next) {
		const { cabin, camperID, week, area } = req.query;
		let camperWeeks = await CamperWeek.getAll();
		if (camperID) {
			camperWeeks = camperWeeks.filter(
				(camper) => camper.camperID === Number.parseInt(camperID)
			);
		}
		if (week) {
			camperWeeks = camperWeeks.filter(
				(camper) => camper.weekNumber === Number.parseInt(week)
			);
		}
		if (area) {
			camperWeeks = camperWeeks.filter(
				(camper) => camper.gender === areas[area]
			);
		}
		if (cabin) {
			camperWeeks = camperWeeks.filter(
				(camper) => camper.cabinName === cabin
			);
		}
		res.json(camperWeeks);
	},
	getOne: [
		param("camperWeekID").exists().isInt().custom(async (id, { req }) => {
			const camperWeek = await CamperWeek.getOne(id);
			if (!camperWeek) {
				throw new Error("Camper Session does not exist")
			}
			req.camperSession = camperWeek;
		}),
		handleValidation,
		async (req, res, next) => {
			const camperWeek = req.camperSession
			res.json(camperWeek);
		}],

	assignCabin: [
		body("cabinSessionID").exists().isInt().custom(async (id, { req }) => {
			const cabinSession = await CabinSession.getOne(id);
			if (!cabinSession) {
				throw new Error("Invalid Cabin Session");
			}
			req.cabinSession = cabinSession;
		}),
		param("camperWeekID").exists().isInt().custom(async (id, { req }) => {
			const camperWeek = await CamperWeek.getOne(id);
			if (!camperWeek) {
				throw new Error("Camper Session does not exist")
			}
			req.camperSession = camperWeek;
		}),
		handleValidation,
		async (req, res, next) => {
			console.log("validated, assigning");
			const camperWeek = req.camperSession;
			const cabinSession = req.cabinSession;
			const assignedCabin = await camperWeek.assignCabin(cabinSession.id);
			res.json(assignedCabin);
		}],
};
