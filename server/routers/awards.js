const router = require("express").Router();
const awardHandler = require("../handlers/awards");

router.get("/", awardHandler.getAll)
router.post("/", awardHandler.create)

module.exports = router;
