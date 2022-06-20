const actionController = require('../handlers/action');

const router = require('express').Router();

router.get("/",(req,res,next)=>{
  res.send('working');
})
router.post("/populate/activities/:weekNumber",actionController.populateActivityList)

module.exports = router;
