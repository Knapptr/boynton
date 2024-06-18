const router = require("express").Router();
const weekHandler = require("../handlers/weekHandler");

router.get("/", weekHandler.getAll);
router.get("/current", weekHandler.getCurrent);
router.get("/:weekNumber", weekHandler.getOne);
router.get(
  "/:weekNumber/activities/capacity",
  weekHandler.getWeeklyCapacityInfo
);
router.get("/:weekNumber/headers", weekHandler.getHeaders);
router.get("/:weekNumber/campers", weekHandler.getCampers);
router.get("/:weekNumber/cabin-sessions", weekHandler.getCabinSessions);
router.get("/:weekNumber/scores", weekHandler.getScores);
router.post(
  "/:weekNumber/periods/staff",
  weekHandler.assignStaffToPeriodNumber
);
router.delete(
  "/:weekNumber/periods/staff",
  weekHandler.unassignStaffToPeriodNumber
);
router.delete("/:weekNumber/cabin-sessions/campers", weekHandler.clearCabins);
module.exports = router;
