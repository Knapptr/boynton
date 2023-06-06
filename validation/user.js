const { body } = require("express-validator");
const pool = require("../db");
const User = require("../models/User");
const userValidation = {
	validateUsername: () => body("username").trim().notEmpty().withMessage("username can not be blank").isAlphanumeric().withMessage("Username must be alphanumeric. No spaces.").isLength({ max: 24 }).withMessage("username too long. 24 characters max"),

	validateNameField: (nameField) => body(nameField).trim().notEmpty().escape().withMessage(`Invalid name field: ${nameField}`),

	validatePassword: () => body("password").trim().notEmpty().escape().isLength({ min: 7, max: 255 }).withMessage("password must be greater than 6 characters, and less than 256"),

	validateBooleanField: (field) => body(field).exists().isBoolean().withMessage(`${field} must be a boolean value`),

	validateRole: () => body("role").isIn(User.VALID_ROLES).withMessage("invalid Role"),

	validateOptionalSessions: () => body("sessions.*.weekNumber").optional().isInt().withMessage("Session weekNumber must be an int"),

	validateUniqueUser: () => body("username").custom(async (username) => {
		const userResult = await User.get(username)
		if (userResult) {
			throw new Error("User already exists.");
		}

	})

}
module.exports = userValidation;
