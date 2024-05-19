const { body, param } = require("express-validator");
const Score = require("../models/score");
const Week = require("../models/week");
const DbError = require("../utils/DbError");


const validateTeam = () => body("awardedTo").trim().isIn(Score.VALID_TEAMS).withMessage("InvalidTeam")

const validatePoints = () => body("points").isInt().withMessage("Points must be an integer");

const validateWeekBody = () => body("weekNumber").isInt().withMessage("Week number is expected to be an integer").custom(async(weekNumber,{req})=>{
	// check week exists
	const res = await Week.get(weekNumber)
	if(!res){throw DbError.notFound("Week not found");}
	req.week = res;
});
const validateWeekParam = () => param("weekNumber").toInt().custom(async(wn,{req})=>{
 const week = await Week.get(wn);
	if(!week){throw DbError.notFound("Week Not Found");}
	req.week = week;
});

const validateFor = () => body("awardedFor").trim().notEmpty().withMessage("Points must have a reason for awarding")

module.exports = {
	validateTeam, validatePoints, validateWeek: validateWeekBody, validateFor,validateWeekParam
}
