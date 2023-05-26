const ActivitySession = require("../../models/activitySession.js");

const activitySessionHandler = {
  async getAllSessions(req, res, next) {
    let results = await ActivitySession.getAll();
    res.json(results);
  }
}

module.exports = activitySessionHandler;
