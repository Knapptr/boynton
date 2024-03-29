const router = require("express").Router();
const { param } = require("express-validator");
const Camper = require("../../models/camper");
const handleValidation = require("../../validation/validationMiddleware");

const areaToGender = {
	BA: "Male",
	GA: "Female",
};
const handler = {
	async getAllCampers(req, res, next) {
		let campers = await Camper.getAll();
		if (req.query.area) {
			const area = req.query.area.toUpperCase();
			campers = campers.filter(
				(camper) => camper.gender === areaToGender[area]
			);
		}
		if (req.query.week) {
			const week = Number.parseInt(req.query.week);
			campers = campers.filter((camper) =>
				camper.weeks.some((session) => session.number === week)
			);
		}
		if (req.query.cabin) {
			const cabin = req.query.cabin;
			const week = Number.parseInt(req.query.week);

			campers = campers.filter((camper) =>
				camper.weeks.some((session) => {
					return week
						? session.cabinName === cabin &&
						session.number === week
						: session.cabinName === cabin;
				})
			);
		}
		res.json(campers);
	},
	getOneCamper: [
		param("camperID").exists().isInt().custom(async (value, { req }) => {
			let camper = await Camper.getById(value);
			if (!camper) {
				throw new Error("Camper does not exist");
			}
			req.camper = camper;
		}),
		handleValidation,
		async (req, res, next) => {
			res.json(req.camper);
		}],
};

module.exports = handler;
