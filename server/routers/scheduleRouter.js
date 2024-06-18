const router = require("express").Router();
const scheduleHandler = require("../handlers/schedule");

router.get("/", scheduleHandler.all)

module.exports = router;
