const StaffSession = require("../../models/staffSession");
const staffSessionHandler = {
  async getDailyUnassigned(req, res, next) {
    const { periodId } = req.params;
    const results = await StaffSession.getAvailablePeriod(periodId);
    res.json(results);
  }
}

module.exports = staffSessionHandler;
