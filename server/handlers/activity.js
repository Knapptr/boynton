const Activity = require("../../models/activity");
const CamperActivity = require("../../models/CamperActivity");
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
      console.log({body:req.body});
        const { camperWeekId, periodId } = req.body;
        const activityId = req.params.activityID;
        const activity = await Activity.get(activityId);
        const camperActivityID = await activity.addCamper(
            camperWeekId,
            periodId
        );
        res.json({ camperActivityID });
    },
    async attendance(req, res) {
        // const activityId = req.params.activityID;
        const isPresent = req.body.isPresent;
        const camperActivityID = req.params.camperActivityID;
        const camperActivity = await CamperActivity.get(camperActivityID);
        console.log({ camperActivity });
        const updated = await camperActivity.setPresent(isPresent);
        res.json(updated);
    },
};
