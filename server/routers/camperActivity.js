const router = require('express').Router();
const camperActivityHandler = require("./../handlers/camperActivity");

router.put("/:camperActivityId", camperActivityHandler.attendance)

module.exports = router;
