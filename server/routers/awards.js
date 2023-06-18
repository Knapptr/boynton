const router = require("express").Router();
const awardHandler = require("../handlers/awards");
const { adminOnly } = require("../middleware/authRole");

router.get("/", awardHandler.getAll)
router.get("/groups",awardHandler.getGrouped);
router.post("/", awardHandler.create)
router.get("/:weekNumber/print", awardHandler.print);

module.exports = router;
