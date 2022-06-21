const router = require('express').Router();
const scoreController = require('../handlers/scores');
const passport = require('passport');

router.get('/',scoreController.getAll);
router.use(passport.authenticate('jwt',{session:false}));
router.post('/',scoreController.insert);
module.exports = router;
