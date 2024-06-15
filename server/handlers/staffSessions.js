const StaffSession = require("../../models/staffSession");
const staffSessionHandler = {
  async getSession(req,res,next){
    const {id} = req.params
    const result = await StaffSession.get(id);
    if(!result){
      res.status(404)
      res.send("Not Found");
      return;
    }
    res.json(result);

  },
  async getDailyUnassigned(req, res, next) {
    const { periodId } = req.params;
    const results = await StaffSession.getAvailablePeriod(periodId);
    res.json(results);
  }
}

module.exports = staffSessionHandler;
