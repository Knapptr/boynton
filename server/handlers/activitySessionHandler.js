const ActivitySession = require("../../models/activitySession");
const StaffSession = require("../../models/staffSession");
const StaffActivity = require("../../models/staffActivity");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");
const handleValidation = require("../../validation/validationMiddleware");
const { validatePeriodId, validateExistingActivityId, validateActivitySessionExists, validateStaffMembers } = require("../../validation/activitySession");
const { body } = require("express-validator");

const activitySessionHandler = {
  async getAllSessions(req, res, next) {
    const { period } = req.query;
    let results = await ActivitySession.getAll();
    if (period) {
      results = results.filter(a => a.periodId === Number.parseInt(period))
    }
    res.json(results);
  },

  async getOneSession(req, res, next) {
    const { activitySessionId } = req.params;
    const activitySession = await ActivitySession.get(activitySessionId);
    if (!activitySession) { next(DbError.notFound("Session Does not exist")) }
    res.json(activitySession);
  },

  create: [
    validateExistingActivityId(),
    validatePeriodId(),
    handleValidation,
    async (req, res, next) => {
      const { activityId, periodId } = req.body;
      try {
        const activitySession = await ActivitySession.create(activityId, periodId);
        res.json(activitySession);
        return;
      } catch (e) {
        next(new Error("something went wrong"));
        return;
      }
    }],

  delete: [
    validateActivitySessionExists(),
    handleValidation,
    async (req, res, next) => {
      // Activity Session is fetched during validation. See validation/activitySession.js
      const activitySession = req.activitySession;
      const deleted = await activitySession.delete();
      if (!deleted) { next(ApiError.server("Nothing deleted")); return; }
      res.status(202).json(deleted);
    }],

  addCampersToActivity: [
    validateActivitySessionExists(),
    body("campers").exists().isArray(),
    body("campers.*.camperSessionId").exists().isInt(),
    handleValidation,
    async (req, res, next) => {
      const { campers } = req.body;
      const activitySession = req.activitySession;
      const camperActivities = await activitySession.addCampers(campers);
      res.json({ camperActivities });

    }],

  addStaffToActivity: [
    validateActivitySessionExists(),
    validateStaffMembers(),
    body("staff").exists().isArray(),
    body("staff.*.staffSessionId").exists().isInt(),
    handleValidation,
    async (req, res, next) => {
      const { staff } = req.body;
      const activitySession = req.activitySession;
      try {
        const response = await activitySession.addStaff(staff)
        res.send(response);
        return;
      } catch (e) {
        next(e)
        return;
      }

    }],

  async removeStaff(req, res, next) {
    const { activitySessionId, staffActivityId } = req.params;
    const staffActivitySession = await StaffActivity.delete(staffActivityId)
    if (!staffActivitySession) { res.send("Could not delete") }
    res.json(staffActivitySession);
  }
}

module.exports = activitySessionHandler;
