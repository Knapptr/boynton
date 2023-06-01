const router = require('express').Router();
const camperActivityHandler = require("./../handlers/camperActivity");

router.put("/:camperActivityId/attendance", camperActivityHandler.attendance)
router.put("/:camperActivityId", camperActivityHandler.update)

module.exports = router;
