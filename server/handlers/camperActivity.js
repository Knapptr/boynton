const { body, param } = require("express-validator");
const ActivitySession = require("../../models/activitySession");
const CamperActivity = require("../../models/CamperActivity");
const handleValidation = require("../../validation/validationMiddleware");
const camperActivityHandler = {
  attendance: [
    body("isPresent").exists().isBoolean(),
    param("camperActivityId").exists().isInt().custom(async (camperActivityId, { req }) => {
      const camperActivity = await CamperActivity.get(camperActivityId);
      if (!camperActivity) {
        throw new Error("Camper Activity does not exist");
      }
      req.camperActivity = camperActivity;
    }),
    handleValidation,
    async (req, res, next) => {
      const isPresent = req.body.isPresent;
      const camperActivity = req.camperActivity;
      const updated = await camperActivity.setPresent(isPresent);
      res.json(updated);
    }],

  update: [
    param("camperActivityId").exists().isInt().custom(async (camperActivityId, { req }) => {
      const camperActivity = await CamperActivity.get(camperActivityId);
      if (!camperActivity) {
        throw new Error("Camper Activity does not exist");
      }
      req.camperActivity = camperActivity;
    }),
    body("activitySessionId").exists().isInt().custom(async (activitySessionId) => {
      const activitySession = await ActivitySession.get(activitySessiodId);
      if (!activitySession) { throw new Error("Invalid Activity Session") };
    }),
    handleValidation,
    async (req, res, next) => {
      const { activitySessionId } = req.body;
      try {
        const camperActivity = req.camperActivity;
        const updated = await camperActivity.update(activitySessionId, false);
        res.json(updated);
      } catch (e) {
        next(e)
      }
    }]

}
module.exports = camperActivityHandler;
