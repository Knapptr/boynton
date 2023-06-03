const router = require("express").Router();
const activitySessionHandler = require("../handlers/activitySessionHandler");

router.get("/", activitySessionHandler.getAllSessions);
router.get("/:activitySessionId", activitySessionHandler.getOneSession);
router.post("/:activitySessionId/campers", activitySessionHandler.addCamperToActivity);
router.post("/:activitySessionId/staff", activitySessionHandler.addStaffToActivity);
router.delete("/:activitySessionId/staff/:staffActivityId", activitySessionHandler.removeStaff)
module.exports = router;
