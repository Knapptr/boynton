const authRole = require('../middleware/authRole')
const router = require("express").Router();
const camperHandler = require("../handlers/camper");
const camperWeekHandler = require("../handlers/camperWeek");

//queries ?area=(ba|ga) ?week=(weekNumber)
router.get("/", camperHandler.getAllCampers);
router.get("/:camperID", camperHandler.getOneCamper);
router.put("/:camperID/:camperSessionID/cabin", authRole.unitHeadOnly,camperWeekHandler.assignCabin);

module.exports = router;
