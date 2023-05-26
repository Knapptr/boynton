const router = require("express").Router();
const activitySessionHandler = require("../handlers/activitySessionHandler");

router.get("/", activitySessionHandler.getAllSessions);

module.exports = router;
