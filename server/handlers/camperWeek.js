const CamperWeek = require("../../models/camperWeek");
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
	async getOne(req, res, next) {
		const { camperWeekID } = req.params;
		const camperWeek = await CamperWeek.getOne(camperWeekID);
		res.json(camperWeek);
	},
	async assignCabin(req, res, next) {
		console.log("assigning Cabin");
		const { camperSessionID } = req.params;
		const { cabinSessionID } = req.body;
		const camperWeek = await CamperWeek.getOne(camperSessionID);
		console.log({ camperWeek });
		const assignedCabin = await camperWeek.assignCabin(cabinSessionID);
		console.log({ assignedCabin });
		res.json(assignedCabin);
	},
};
