const CabinSession = require("../../models/cabinSession");
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
				(session) => session.cabinArea === area
			);
		}
		res.json(cabinSessions);
	},
	async getCampers(req, res, next) {
		const cabinSessionID = req.params.cabinSessionID;
		const cabinSession = await CabinSession.get(cabinSessionID);
		const campers = await cabinSession.getCampers();
		if (campers) {
			await Promise.all(campers.map((camper) => camper.init()));
		}
		res.json(campers);
	},
};
