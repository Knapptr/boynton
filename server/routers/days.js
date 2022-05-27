const router = require("express").Router();
const daysHandler = require("../handlers/days");

router.get("/", daysHandler.getAll);

module.exports = router;
