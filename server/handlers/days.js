const Day = require("../../models/day");
module.exports = {
	async getAll(req, res, next) {
		let { week } = req.query;
		let days = await Day.getAll();
		if (week) {
			week = Number.parseInt(week);
			days = days.filter((day) => day.weekNumber === week);
		}
		res.json(days);
	},
};
