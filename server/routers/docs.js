const passport = require("passport");
const path = require("path");

const router = require("express").Router();

router.use(passport.authenticate("jwt", { session: false }));
router.get("/counselor-handbook",(req,res)=>{
  res.sendFile(path.join(process.cwd(),"campData","CounselorHandbook23.pdf"));
})
module.exports = router;
