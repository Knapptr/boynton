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
		const { periodId } = req.params;
		const period = await Period.get(periodId);
		let activities = await period.getActivities();
		res.json(activities);
	},
  async getOne(req,res,next){
    const {periodId} = req.params;
    const period = await Period.get(periodId);
    await period.getCampers();
    res.json(period);
  },
	async getCampers(req, res, next) {
		const { cabin, assigned } = req.query;
		const { periodId } = req.params;
		const period = await Period.get(periodId);
		let campers = await period.getCampers();
		if (cabin) {
			campers = campers.filter((c) => c.cabinName === cabin);
		}
		if (assigned) {
			if (assigned === "true") {
				campers = campers.filter((c) => c.activityID !== null);
			} else {
				campers = campers.filter((c) => c.activityID === null);
			}
		}
		res.json(campers);
	},
};
