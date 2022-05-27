const CamperWeek = require("../../models/camperWeek");
module.exports = {
	async getAll(req, res, next) {
		const { camperID, week } = req.query;
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
		res.json(camperWeeks);
	},
	async getOne(req, res, next) {
		const { camperWeekID } = req.params;
		const camperWeek = await CamperWeek.getOne(camperWeekID);
		res.json(camperWeek);
	},
	async assignCabin(req, res, next) {
		const { camperSessionID } = req.params;
		const { cabinSessionID } = req.body;
		const camperWeek = await CamperWeek.getOne(camperSessionID);
		const assignedCabin = await camperWeek.assignCabin(cabinSessionID);
		res.json(assignedCabin);
	},
};
