const router = require("express").Router();
const awardHandler = require("../handlers/awards");

router.get("/", awardHandler.getAll)
router.get("/groups",awardHandler.getGrouped);
router.post("/", awardHandler.create)
router.get("/print/:weekNumber", awardHandler.print);

module.exports = router;
