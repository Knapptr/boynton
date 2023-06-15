const { body } = require('express-validator');

const activityValidation = {
	name: () => body("name").trim().notEmpty().withMessage("Invalid activity name"),
	description: () => body("description").trim().optional(),
	camperWeekId: () => body("camperWeekId").isInt().withMessage("camper week must exist and be an int"),
	periodId: () => body("period").isInt().withMessage("Period id must be an int"),
	attendance: () => body("isPresent").exists().isBoolean()
}


module.exports = activityValidation;
