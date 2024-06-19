const { param, body } = require("express-validator");
const Camper = require("../../models/camper");
const CamperComment = require("../../models/camperComment");
const handleValidation = require("../../validation/validationMiddleware");
const User = require("../../models/User");
const { sendToNotifications } = require("../../slackMessages");

const router = require("express").Router();

router.post("/", [
  (req,res,next) => {
    // add username to request body
    req.body.username = req.user.username;
    next();
  }
  ,
  body("content").trim(),
  body("camperId").exists().custom(async (camperId,{req})=>{
   const camper = await Camper.getById(camperId);
	if (!camper){
	  throw new Error("Camper does not exist");
	}
    req.camper=camper;
  }),
  handleValidation,
  async (req,res,next) => {
	const {camperId,username,content} = req.body;
    const {camper,user} = req;
	const comment = await CamperComment.create({camperId,username,content});
	res.json(comment);
    //////////SLACK
    const message = {
	"blocks": [
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `*${camper.firstName} ${camper.lastName}*: ${comment.content}`
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "plain_text",
					"text": `${user.firstName} ${user.lastName[0]}.`,
					"emoji": true
				}
			]
		}
	]
}
    sendToNotifications(message)
    /////////////////////////

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
