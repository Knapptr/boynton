const CamperActivity = require("../../models/CamperActivity");
const camperActivityHandler = {
  async attendance(req, res, next) {
    const isPresent = req.body.isPresent;
    const camperActivityID = req.params.camperActivityId;
    const camperActivity = await CamperActivity.get(camperActivityID);
    const updated = await camperActivity.setPresent(isPresent);
    res.json(updated);
  }
}
module.exports = camperActivityHandler;
