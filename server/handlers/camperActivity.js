const CamperActivity = require("../../models/CamperActivity");
const camperActivityHandler = {
  async attendance(req, res, next) {
    const isPresent = req.body.isPresent;
    const camperActivityId = req.params.camperActivityId;
    try {
      const camperActivity = await CamperActivity.get(camperActivityId);
      const updated = await camperActivity.setPresent(isPresent);
      res.json(updated);
    } catch (e) {
      next(e)
    }
  },

  async update(req, res, next) {
    const { camperActivityId } = req.params;
    const { activitySessionId } = req.body;
    console.log("Update with", { activitySessionId, camperActivityId });
    try {
      const camperActivity = await CamperActivity.get(camperActivityId)
      const updated = await camperActivity.update(activitySessionId, false);
      res.json(updated);
    } catch (e) {
      next(e)
    }
  }

}
module.exports = camperActivityHandler;
