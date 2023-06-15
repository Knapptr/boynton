const { param, body } = require("express-validator");
const CabinSession = require("../../models/cabinSession");
const CamperWeek = require("../../models/camperWeek");
const handleValidation = require("../../validation/validationMiddleware");
module.exports = {
	async getAll(req, res, next) {
		let { week, area } = req.query;
		let cabinSessions = await CabinSession.getAll();
		if (week) {
			week = Number.parseInt(week);
			cabinSessions = cabinSessions.filter(
				(session) => session.weekNumber === week
			);
		}
		if (area) {
			area = area.toUpperCase();
			cabinSessions = cabinSessions.filter(
				(session) => session.area === area
			);
		}
		res.json(cabinSessions);
	},
	getCampers: [
		param("cabinSessionID").exists().isInt().custom(async (id, { req }) => {
			const cabinSession = await CabinSession.get(id);
			if (!cabinSession) {
				throw new Error("Cabin Session does not exist");
			}
			req.cabinSession = cabinSession;

		}),
		handleValidation,
		async (req, res, next) => {
			const cabinSession = req.cabinSession;
			const campers = await cabinSession.getCampers();
			if (!campers) { res.json([]) }
			res.json(campers);
		}],

	assignCampers: [
		param("cabinSessionId").exists().isInt().custom(async (cabinSessionId, { req }) => {
			const cabinSession = await CabinSession.get(cabinSessionId);
			if (!cabinSession) {
				throw new Error("Cabin Session does not exist");
			}
			req.cabinSession = cabinSession;
		}),
		body("campers").isArray(),
		body("campers.*.id").exists().isInt().custom(async (camperSessionId, { req }) => {
			const camperSession = await CamperWeek.getOne(camperSessionId);
			if (!camperSession) {
				throw new Error("Camper Session does not exist");
			}
		}),
		handleValidation,
		async (req, res, next) => {
			const campers = req.body.campers;
			const cabinSession = req.cabinSession;
			const addedSessions = await cabinSession.addCampers(campers);
			res.json(addedSessions)

		}],

	removeCamper: [
		param("cabinSessionId").exists().isInt().custom(async (cabinSessionId, { req }) => {
			const cabinSession = await CabinSession.get(cabinSessionId);
			if (!cabinSession) { throw new Error("Cabin Session does not exist") }
			req.cabinSession = cabinSession;
		}),
		param("camperSessionId").exists().isInt().custom(async (camperSessionId, { req }) => {
			const camperSession = await CamperWeek.getOne(camperSessionId);
			if (!camperSession) { throw new Error("Camper Session does not exist"); }
			console.log({ cabinSession: req.cabinSession, camperSession })
			if (camperSession.cabinSessionID !== req.cabinSession.id) {
				throw new Error("Camper not in cabin")
			}
			req.camperSession = camperSession;
		}),
		handleValidation,
		async (req, res, next) => {
			const cabinSession = req.cabinSession
			const camperSession = req.camperSession
			const response = await cabinSession.removeCamper(camperSession.id);
			res.json(response);
		}]
};
