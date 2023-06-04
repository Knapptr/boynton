const ActivitySession = require("../../models/activitySession");
const StaffSession = require("../../models/staffSession");
const StaffActivity = require("../../models/staffActivity");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");

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
    res.json(activitySession);
  },

  async create(req, res, next) {
    const { activityId, periodId } = req.body;
    try {
      const activitySession = await ActivitySession.create(activityId, periodId);
      res.json(activitySession);
      return;
    } catch (e) {
      console.log({ e })
      if (e.code === "23505") {
        next(DbError.alreadyExists("The activity already exists"))
        return;
      }
      next(new Error("something went wrong"));
      return;
    }

  },

  async delete(req, res, next) {
    const { activitySessionId } = req.params;
    //find the error session
    const activitySession = await ActivitySession.get(activitySessionId);
    if (!activitySession) { next(ApiError.notFound("Activity Session Not Found")); return; }
    const deleted = await activitySession.delete();
    if (!activitySession) { next(ApiError.server("Nothing deleted")); return; }
    res.json(deleted);
  },

  async addCamperToActivity(req, res, next) {
    const { camperWeekId } = req.body;
    const activitySessionId = req.params.activitySessionId
    const activitySession = await ActivitySession.get(activitySessionId);
    const camperActivityId = await activitySession.addCamper(camperWeekId);
    res.json({ camperActivityId });

  },

  async addStaffToActivity(req, res, next) {
    const { activitySessionId } = req.params
    const { staffSessionId } = req.body;
    const activitySession = await ActivitySession.get(activitySessionId);
    const staffSession = await StaffSession.get(staffSessionId);
    console.log({ activitySession, staffSession });
    //TODO handle non activty or non staff session
    if (!activitySession || !staffSession) {
      next(new ApiError("Cannot handle. Error handling not yet implemented"))
      return;
    }
    try {
      const response = activitySession.addStaff(staffSession)
      res.send(response);
      return;
    } catch (e) {
      next(e)
      return;
    }

  },

  async removeStaff(req, res, next) {
    const { activitySessionId, staffActivityId } = req.params;
    const staffActivitySession = await StaffActivity.delete(staffActivityId)
    if (!staffActivitySession) { res.send("Could not delete") }
    res.json(staffActivitySession);
  }
}

module.exports = activitySessionHandler;
