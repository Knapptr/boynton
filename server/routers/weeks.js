const router = require("express").Router();
const middleware = require("../../utils/middleware");
const weekHandler = require("../handlers/weekHandler");

router.get("/", weekHandler.getAll);
router.get("/:weekNumber", weekHandler.getOne);
module.exports = router;
