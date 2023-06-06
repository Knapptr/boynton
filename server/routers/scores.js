const router = require('express').Router();
const scoreController = require('../handlers/scores');
const passport = require('passport');

// router.use(passport.authenticate('jwt', { session: false }));
router.get('/', scoreController.getAll);
router.post('/', scoreController.insert);
module.exports = router;
