const router = require("express").Router();
const middleware = require("../../utils/middleware");
const weekHandler = require("../handlers/weekHandler");

router.get("/", weekHandler.getAll);
router.get("/current", weekHandler.getCurrent);
router.get("/:weekNumber", weekHandler.getOne);
router.get("/:weekNumber/campers", weekHandler.getCampers)
router.get("/:weekNumber/cabin-sessions", weekHandler.getCabinSessions)
router.delete("/:weekNumber/cabin-sessions/campers", weekHandler.clearCabins);
module.exports = router;
