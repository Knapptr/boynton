const router = require("express").Router();
const Camper = require("../../models/camper");

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
				camper.weeks.some((session) => session.weekNumber === week)
			);
		}
		if (req.query.cabin) {
			const cabin = req.query.cabin;
			const week = Number.parseInt(req.query.week);

			campers = campers.filter((camper) =>
				camper.weeks.some((session) => {
					return week
						? session.cabinName === cabin &&
								session.weekNumber === week
						: session.cabinName === cabin;
				})
			);
		}
		res.json(campers);
	},
	async getOneCamper(req, res, next) {
		const id = req.params.camperID;
		let camper = await Camper.getById(id, true);
		res.json(camper);
	},
};

module.exports = handler;
