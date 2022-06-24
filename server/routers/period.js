const router = require("express").Router();
const periodHandler = require("../handlers/period");

router.get("/", periodHandler.getAll);
router.get("/:periodId", periodHandler.getOne);
router.get("/:periodId/activities", periodHandler.getActivities);
router.get("/:periodId/campers", periodHandler.getCampers);

module.exports = router;
