const router = require("express").Router();
const activityHandler = require("../handlers/activity");

router.get("/", activityHandler.getAll);
router.get("/:activityID", activityHandler.getOne);
router.post("/:activityID/campers", activityHandler.addCamper);
router.put(
    "/:activityID/campers/:camperActivityID",
    activityHandler.attendance
);

module.exports = router;
