const Period = require("../../models/period");

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
	async getActivities(req, res, next) {
		const { periodID } = req.params;
		const period = await Period.get(periodID);
		let activities = await period.getActivities();
		res.json(activities);
	},
};
