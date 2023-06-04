const Activity = require("../../models/activity");
const CamperActivity = require("../../models/CamperActivity");
const ApiError = require("../../utils/apiError");
const jsonError = require("../../utils/jsonError");
module.exports = {
    async create(req, res, next) {
        //TODO Add sanitization and more validation
        const { name, description } = req.body;
        if (!name || !description) { next(ApiError.notCreated("Needs name and description")); return; }
        const activity = await Activity.create({ name, description })
        if (!activity) { next(ApiError.notCreated("Activity not created")); return; }
        res.json(activity)
    },
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
        console.log({ body: req.body });
        const { camperWeekId, periodId } = req.body;
        const activityId = req.params.activityID;
        console.log({
            camperWeekId, periodId, activityId
        })
        const activity = await Activity.get(activityId);
        console.log({ activity });
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
