const router = require("express").Router();
const activitySessionHandler = require("../handlers/activitySessionHandler");
const { adminOnly } = require("../middleware/authRole");

router.get("/", activitySessionHandler.getAllSessions);
router.get("/:activitySessionId", activitySessionHandler.getOneSession);
router.post("/:activitySessionId/campers", activitySessionHandler.addCamperToActivity);
// Protected
router.use(adminOnly);
router.post("/", activitySessionHandler.create)
router.delete("/:activitySessionId", activitySessionHandler.delete);
router.post("/:activitySessionId/staff", activitySessionHandler.addStaffToActivity);
router.delete("/:activitySessionId/staff/:staffActivityId", activitySessionHandler.removeStaff)
module.exports = router;
