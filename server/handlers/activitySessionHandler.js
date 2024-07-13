const ActivitySession = require("../../models/activitySession");
const StaffSession = require("../../models/staffSession");
const StaffActivity = require("../../models/staffActivity");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");
const handleValidation = require("../../validation/validationMiddleware");
const {
  validatePeriodId,
  validateExistingActivityId,
  validateActivitySessionExists,
  validateStaffMembers,
  validateCampers,
  validateStaffOns,
} = require("../../validation/activitySession");
const { body, param } = require("express-validator");
const Period = require("../../models/period");
const Activity = require("../../models/activity");
const pool = require("../../db");

const activitySessionHandler = {
  async getAllSessions(req, res, next) {
    const { period } = req.query;
    let results = await ActivitySession.getAll();
    if (period) {
      results = results.filter((a) => a.periodId === Number.parseInt(period));
    }
    // console.log({campers:results[1].campers});
    res.json(results);
  },

  getOneSession: [
    param("activitySessionId").isInt(),
    handleValidation,
    async (req, res, next) => {
      const { activitySessionId } = req.params;
      const activitySession = await ActivitySession.get(activitySessionId);
      if (!activitySession) {
        next(DbError.notFound("Session Does not exist"));
        return;
      }

      res.json(activitySession);
    },
  ],

  create: [
    body("activityId")
      .exists()
      .isInt()
      .custom(async (activityId, { req }) => {
        // make sure that activity exists
        const activity = await Activity.get(activityId);
        if (!activity) {
          throw ApiError.notFound("Activity does not exist");
        }
        // make sure that activity session for activity on this period isn't already scheduled
        if (activity.sessions.some((s) => s.periodId === req.body.periodId)) {
          throw ApiError.badRequest(
            "Activity session already scheduled for period"
          );
        }
      }),
    body("periodId")
      .exists()
      .isInt()
      .custom(async (periodId) => {
        const period = await Period.get(periodId);
        if (!period) {
          throw ApiError.notFound("Period does not exist");
        }
      }),
    handleValidation,
    async (req, res, next) => {
      const { activityId, periodId } = req.body;
      try {
        const activitySessions = await ActivitySession.create(
          activityId,
          periodId
        );
        console.log({activitySessions})
        res.json(activitySessions);
        return;
      } catch (e) {
        next(new Error("something went wrong"));
        return;
      }
    },
  ],

  delete: [
    validateActivitySessionExists(),
    handleValidation,
    async (req, res, next) => {
      // Activity Session is fetched during validation. See validation/activitySession.js
      const activitySession = req.activitySession;
      const deleted = await activitySession.delete();
      if (!deleted) {
        next(ApiError.server("Nothing deleted"));
        return;
      }
      res.status(202).json(deleted);
    },
  ],

  addCampersToActivity: [
    validateActivitySessionExists(),
    validateCampers(),
    handleValidation,
    async (req, res, next) => {
      const { campers } = req.body;
      const activitySession = req.activitySession;
      console.log({activitySession});
      const camperActivities = await activitySession.addCampers(campers);
      res.json({ camperActivities });
    },
  ],

  addStaffToActivity: [
    validateActivitySessionExists(),
    validateStaffOns(),
    handleValidation,
    async (req, res, next) => {
      const {activitySession,staffOns} = req;
      try {
        const response = await activitySession.addStaff(staffOns);
        res.send(response);
        return;
      } catch (e) {
        next(e);
        return;
      }
    },
  ],

  async removeStaff(req, res, next) {
    const { activitySessionId, staffOnPeriodId } = req.params;
    const staffActivitySession = await StaffActivity.delete(staffOnPeriodId);
    if (!staffActivitySession) {
      res.send("Could not delete");
      return;
    }
    res.json(staffActivitySession);
  },
};

module.exports = activitySessionHandler;
