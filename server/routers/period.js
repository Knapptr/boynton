const router = require("express").Router();
const periodHandler = require("../handlers/period");

router.get("/", periodHandler.getAll);
router.get("/:periodId", periodHandler.getOne);
router.get("/:periodId/staff",periodHandler.getStaffOns);
router.get("/:periodId/activities", periodHandler.getActivities);
router.get("/:periodId/campers", periodHandler.getCampers);
router.post("/:periodId/staff", periodHandler.assignStaff);
router.delete("/:periodId/staff", periodHandler.deleteStaff);

module.exports = router;
