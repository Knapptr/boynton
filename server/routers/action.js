const actionController = require('../handlers/action');
const passport = require('passport');

const router = require('express').Router();

router.use(passport.authenticate("jwt", { session: false }));
router.get("/",(req,res,next)=>{
  res.send('working');
})
router.post("/populate/activities/:weekNumber",actionController.populateActivityList)

module.exports = router;
