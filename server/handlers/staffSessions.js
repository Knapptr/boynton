const StaffSession = require("../../models/staffSession");
const staffSessionHandler = {
  async assignToCabin  (req, res, next) {
    const { id } = req.params;
    const { cabinId } = req.body;
    const result = await StaffSession.get(id);
    if (!result) {
      res.status(404);
      res.send("That didn't work");
      return;
    }
    const updateResult = await StaffSession.assignToCabin(result, cabinId);
    if(!updateResult){res.status(500); res.send("Something went wrong")}
    res.status(200);
    res.send("OK");
    return;
  },
  async getSession(req, res, next) {
    const { id } = req.params;
    const result = await StaffSession.get(id);
    if (!result) {
      res.status(404);
      res.send("Not Found");
      return;
    }
    res.json(result);
  },
  async getAssignedPeriod(req,res,next){
    const {periodId} = req.params;
    const result = await StaffSession.getOnPeriod(periodId);
    if(!result){
      res.status(404);
      res.send("Something went wrong");
      return;
    }
    res.json(result);
  }
};

module.exports = staffSessionHandler;
