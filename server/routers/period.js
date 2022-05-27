const router = require("express").Router();
const periodHandler = require("../handlers/period");

router.get("/", periodHandler.getAll);
router.get("/:periodID/activities", periodHandler.getActivities);

module.exports = router;
