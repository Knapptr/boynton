const router = require("express").Router()
const jwt = require("jsonwebtoken");

const LINK_TTL = 60 * 30; // Half an hour

router.get("/", (req,res,next)=>{
	  const token = jwt.sign({ttl:LINK_TTL},process.env.SIGNUP_LINK_SECRET, {expiresIn: LINK_TTL}) 
	  res.json({token})
})

module.exports = router;
