const router = require("express").Router();
const activityHandler = require("../handlers/activity");
const { adminOnly } = require("../middleware/authRole");

router.get("/", activityHandler.getAll);
router.get("/:activityID", activityHandler.getOne);
router.post("/:activityID/campers", activityHandler.addCamper);
router.post(
	"/:activityID/campers/:camperActivityID",
	activityHandler.attendance
);

// Protected Routes
router.use(adminOnly);
router.post("/", activityHandler.create)
module.exports = router;
