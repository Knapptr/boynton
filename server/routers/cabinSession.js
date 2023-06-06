const router = require("express").Router();
const cabinSessionHandler = require("../handlers/cabinSessionHandler");

router.get("/", cabinSessionHandler.getAll);
router.post("/:cabinSessionId/campers", cabinSessionHandler.assignCampers);
router.get("/:cabinSessionID/campers", cabinSessionHandler.getCampers);

module.exports = router;
