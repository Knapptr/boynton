const actionController = require('../handlers/action');
const passport = require('passport');

const router = require('express').Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use((req,res,next)=>{
  if(req.user.role !== 'admin'){res.status(401);res.send('not authorized');return;}
  next();
})
router.post("/populate/activities/:weekNumber",actionController.populateActivityList)

module.exports = router;
