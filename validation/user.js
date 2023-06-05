const User = require("../models/User");
module.exports = {

	validateUsername: () => body("username").trim().notEmpty().withMessage("username can not be blank").isAlphanumeric().withMessage("Username must be alphanumeric. No spaces.").isLength({ max: 24 }).withMessage("username too long. 24 characters max"),

	validateNameField: (nameField) => body(nameField).trim().notEmpty().escape().withMessage(`Invalid name field: ${nameField}`),

	validatePassword: () => body("password").trim().notEmpty().escape().isLength({ min: 7, max: 255 }).withMessage("password must be greater than 6 characters, and less than 256"),

	validateBooleanField: (field) => body(field).exists().isBoolean().withMessage(`${field} must be a boolean value`),

	validateRole: () => body("role").isIn(User.VALID_ROLES).withMessage("invalid Role"),
	handleValidation,

}
