const router = require('express').Router();
const camperActivityHandler = require("./../handlers/camperActivity");

router.post("/:camperActivityId/attendance", camperActivityHandler.attendance)
router.post("/:camperActivityId", camperActivityHandler.update)

module.exports = router;
