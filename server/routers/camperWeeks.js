const router = require("express").Router();
const camperWeekHandler = require("../handlers/camperWeek");

router.get("/", camperWeekHandler.getAll);
router.get("/:camperWeekID", camperWeekHandler.getOne);

module.exports = router;
