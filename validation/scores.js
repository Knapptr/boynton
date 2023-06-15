const { body } = require("express-validator");
const Score = require("../models/score");


const validateTeam = () => body("awardedTo").trim().isIn(Score.VALID_TEAMS).withMessage("InvalidTeam")

const validatePoints = () => body("points").isInt().withMessage("Points must be an integer");

const validateWeek = () => body("weekNumber").isInt().withMessage("Week number is expected to be an integer");

const validateFor = () => body("awardedFor").trim().notEmpty().withMessage("Points must have a reason for awarding")

module.exports = {
	validateTeam, validatePoints, validateWeek, validateFor
}
