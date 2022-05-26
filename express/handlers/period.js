const Period = require("../../models/period");

module.exports = {
	async getAll(req, res, next) {
		let { dayid } = req.query;
		let periods = await Period.getAll();
		if (dayid) {
			dayid = Number.parseInt(dayid);
			periods = periods.filter((period) => period.dayID === dayid);
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
