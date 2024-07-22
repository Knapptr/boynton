const router = require("express").Router();
const activitySessionHandler = require("../handlers/activitySessionHandler");
const { adminOnly, programmingOnly } = require("../middleware/authRole");

router.get("/", activitySessionHandler.getAllSessions);
router.get("/:activitySessionId", activitySessionHandler.getOneSession);
router.post(
  "/:activitySessionId/campers",
  activitySessionHandler.addCampersToActivity
);
// Programming staff only
router.use(programmingOnly);
router.post("/", activitySessionHandler.create);
router.post("/:activitySessionId/location", activitySessionHandler.setLocation)
router.delete("/:activitySessionId", activitySessionHandler.delete);
router.post(
  "/:activitySessionId/staff",
  activitySessionHandler.addStaffToActivity
);
router.delete(
  "/:activitySessionId/staff/:staffOnPeriodId",
  activitySessionHandler.removeStaff
);
module.exports = router;
