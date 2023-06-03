const ActivitySession = require("../../models/activitySession");
const StaffSession = require("../../models/staffSession");
const StaffActivity = require("../../models/staffActivity")

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
      next(new Error("Cannot handle. Error handling not yet implemented"))
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
