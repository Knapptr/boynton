const router = require("express").Router();
const cabinSessionHandler = require("../handlers/cabinSessionHandler");

router.get("/", cabinSessionHandler.getAll);
router.get("/:cabinSessionID/campers", cabinSessionHandler.getCampers);

module.exports = router;
