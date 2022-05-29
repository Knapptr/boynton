const Activity = require("../../models/activity");
const jsonError = require("../../utils/jsonError");
module.exports = {
	async getOne(req, res, next) {
		const id = req.params.activityID;
		let activity = await Activity.get(id);
		res.json(activity);
	},
	async getAll(req, res, next) {
		let activities = await Activity.getAll();
		const { period } = req.query;
		if (period) {
			activities = activities.filter(
				(activity) => activity.periodID === Number.parseInt(period)
			);
		}
		res.json(activities);
	},
	async addCamper(req, res, next) {
		const { camperSessionID } = req.body;
		const activityID = req.params.activityID;
		const activity = await Activity.get(activityID);
		const camperActivityID = await activity.addCamper(camperSessionID);
		res.json({ camperActivityID });
	},
};
