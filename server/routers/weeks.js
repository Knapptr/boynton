const router = require("express").Router();
const middleware = require("../../utils/middleware");
const weekHandler = require("../handlers/weekHandler");

router.get("/", weekHandler.getAll);
router.get("/:weekNumber", weekHandler.getOne);
router.get("/:weekNumber/cabin-sessions", weekHandler.getCabinSessions)
module.exports = router;
