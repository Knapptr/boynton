const ActivitySession = require("../../models/activitySession.js");

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

  }
}

module.exports = activitySessionHandler;
