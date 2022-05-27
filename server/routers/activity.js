const router = require("express").Router();
const activityHandler = require("../handlers/activity");

router.get("/:activityID/campers", activityHandler.getCampers);
router.post("/:activityID/campers", activityHandler.addCamper);

module.exports = router;
