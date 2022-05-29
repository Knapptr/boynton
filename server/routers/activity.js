const router = require("express").Router();
const activityHandler = require("../handlers/activity");

router.get("/", activityHandler.getAll);
router.get("/:activityID", activityHandler.getOne);
router.post("/:activityID/campers", activityHandler.addCamper);

module.exports = router;
