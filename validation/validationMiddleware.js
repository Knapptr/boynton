const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const handleValidation = (req, res, next) => {
	const result = validationResult(req);
	if (result.isEmpty()) {
		next();
		return;
	}
	next(ApiError.validation(result.errors, "Invalid Input"))
	return;
}

module.exports = handleValidation;
