const { param, body } = require("express-validator");
const Activity = require("../../models/activity");
const CamperActivity = require("../../models/CamperActivity");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");
const jsonError = require("../../utils/jsonError");
const activityValidation = require("../../validation/activity");
const handleValidation = require("../../validation/validationMiddleware");
module.exports = {
    create: [
        activityValidation.name(),
        activityValidation.description(),
        handleValidation,
        async (req, res, next) => {
            const { name, description } = req.body;
            try {
                const activity = await Activity.create({ name, description })
                res.json(activity)
                return;
            } catch (e) {
                if (e.code = 23505) { next(DbError.alreadyExists("The activity already exists")); return; }
                next(e);
            }
        }],
    update:[
        param("activityID").exists().custom(async (activityId, { req }) => {
            const activity = await Activity.get(activityId);
            if (!activity) {
                throw new Error("Activity does not exist");
            }
            req.activity = activity;
        }),
        body("updatedFields").exists().isObject(),
        body("updatedFields.name").isString().optional(),
        body("updatedFields.description").isString().optional(),
        body("updatedFields.capacity").isInt().optional({nullable:true}),
        handleValidation,
        async (req,res,next)=>{
            // update fields as nesc
            const {activity} = req;
            const {updatedFields} = req.body;
            const result = await activity.update(updatedFields)
            if(result){
                res.send("ok")
            }else{
                res.status(500);
                res.send("not ok");
            }
            
        }
    ],
    getOne: [
        param("activityID").exists().custom(async (activityId, { req }) => {
            const activity = await Activity.get(activityId);
            if (!activity) {
                throw new Error("Activity does not exist");
            }
            req.activity = activity;
        }),
        handleValidation,
        async (req, res, next) => {
            let activity = req.activity
            res.json(activity);
        }],
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
    addCamper: [
        activityValidation.periodId(),
        activityValidation.camperWeekId(),
        handleValidation,
        async (req, res, next) => {
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
        }],
    attendance: [
        activityValidation.attendance(),
        handleValidation,
        async (req, res) => {
            const isPresent = req.body.isPresent;
            const camperActivityID = req.params.camperActivityID;
            const camperActivity = await CamperActivity.get(camperActivityID);
            console.log({ camperActivity });
            const updated = await camperActivity.setPresent(isPresent);
            res.json(updated);
        }],
};
