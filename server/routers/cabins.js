const router = require("express").Router();
const cabinHandler = require("../handlers/cabinHandler");

router.get("/",cabinHandler.getAllCabins)
router.get("/:cabinName",cabinHandler.getOneCabin)

module.exports = router;
