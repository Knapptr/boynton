const { param, body } = require("express-validator");
const Camper = require("../../models/camper");
const CamperComment = require("../../models/camperComment");
const handleValidation = require("../../validation/validationMiddleware");
const User = require("../../models/User");

const router = require("express").Router();

router.post("/", [
  (req,res,next) => {
    // add username to request body
    req.body.username = req.user.username;
    next();
  }
  ,
  body("content").trim(),
  body("camperId").exists().custom(async (camperId)=>{
   const camper = await Camper.getById(camperId);
    console.log({camperId});
    console.log({camper});
	if (!camper){
	  throw new Error("Camper does not exist");
	}
  }),
  handleValidation,
  async (req,res,next) => {
	const {camperId,username,content} = req.body;
	const comment = await CamperComment.create({camperId,username,content});
	res.json(comment);

  }
]);

router.delete("/:id", [
  // get the comment by the id
  param("id").exists().custom(async (id,{req})=>{
    const comment = await CamperComment.get(id);
    //handle if it doesnt exist
    if(!comment){throw new Error("Comment does not exist");}
    // handle if delete requestor is not admin OR author
    if(req.user.role !== "admin" && req.user.username !== comment.username){
      throw new Error("Not Authorized");
    }
    req.comment = comment;
  }),
  async (req,res,next)  => {
    console.log("Final step", req.comment);
    let deletedComment = await req.comment.delete();
    res.json(deletedComment);
  }

])

module.exports = router;
