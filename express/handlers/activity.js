const Activity = require("../../models/activity");
module.exports = {
	async addCamper(req, res, next) {
		const { camperSessionID } = req.body;
		const activityID = req.params.activityID;
		const activity = await Activity.get(activityID);
		const camperActivityID = await activity.addCamper(camperSessionID);
		res.json({ camperActivityID });
	},
	async getCampers(req, res, next) {
		const { activityID } = req.params;
		const activity = await Activity.get(activityID);
		const campers = await activity.getCampers();
		res.json(campers);
	},
};
