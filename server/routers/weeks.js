const router = require("express").Router();
const weekHandler = require("../handlers/weekHandler");

router.get("/", weekHandler.getAll);
router.get("/current", weekHandler.getCurrent);
router.get("/:weekNumber", weekHandler.getOne);
router.get("/:weekNumber/headers",weekHandler.getHeaders);
router.get("/:weekNumber/campers", weekHandler.getCampers)
router.get("/:weekNumber/cabin-sessions", weekHandler.getCabinSessions)
router.get("/:weekNumber/scores", weekHandler.getScores);
router.delete("/:weekNumber/cabin-sessions/campers", weekHandler.clearCabins);
module.exports = router;
