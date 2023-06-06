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
				(session) => session.area === area
			);
		}
		res.json(cabinSessions);
	},
	async getCampers(req, res, next) {
		const cabinSessionID = req.params.cabinSessionID;
		const cabinSession = await CabinSession.get(cabinSessionID);
		const campers = await cabinSession.getCampers();
		res.json(campers);
	},

	async assignCampers(req, res, next) {
		const cabinSessionId = req.params.cabinSessionId;
		const campers = req.body.campers;
		console.log({ campers });
		const cabinSession = await CabinSession.get(cabinSessionId);
		const addedSessions = await cabinSession.addCampers(campers);
		res.json(addedSessions)

	},

	async removeCamper(req, res, next) {
		const { cabinSessionId, camperSessionId } = req.params;
		const cabinSession = await CabinSession.get(cabinSessionId);
		console.log({ cabinSession });
		const response = await cabinSession.removeCamper(camperSessionId);
		res.json(response);
	}
};
