const router = require("express").Router();
const periodHandler = require("../handlers/period");

router.get("/", periodHandler.getAll);
router.get("/:periodID/activities", periodHandler.getActivities);
router.get("/:periodID/campers", periodHandler.getCampers);

module.exports = router;
