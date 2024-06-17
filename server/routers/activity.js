const router = require("express").Router();
const activityHandler = require("../handlers/activity");
const { adminOnly, programmingOnly } = require("../middleware/authRole");

router.get("/", activityHandler.getAll);
router.get("/:activityID", activityHandler.getOne);
router.post("/:activityID/campers", activityHandler.addCamper);
router.post(
	"/:activityID/campers/:camperActivityID",
	activityHandler.attendance
);

// Protected Routes
router.use(programmingOnly)
router.post("/", activityHandler.create)
router.put("/:activityID",activityHandler.update)
module.exports = router;
