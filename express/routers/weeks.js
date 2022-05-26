const router = require("express").Router();
const middleware = require("../../utils/middleware");
const weekHandler = require("../handlers/weekHandler");

router.get("/", weekHandler.getAllWeeks);
module.exports = router;
