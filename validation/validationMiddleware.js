const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const handleValidation = (req, res, next) => {
	console.log("validating");
	const result = validationResult(req);
	if (result.isEmpty()) {
		next();
		return;
	}
	console.log("Not Empty Validation");
	next(ApiError.validation(result.errors, "Invalid Input"))
	return;
}

module.exports = handleValidation;
