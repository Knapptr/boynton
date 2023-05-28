const ActivitySession = require("../../models/activitySession.js");

const activitySessionHandler = {
  async getAllSessions(req, res, next) {
    const { period } = req.query;
    let results = await ActivitySession.getAll();
    if (period) {
      results = results.filter(a => a.periodId === Number.parseInt(period))
    }
    res.json(results);
  }
}

module.exports = activitySessionHandler;
