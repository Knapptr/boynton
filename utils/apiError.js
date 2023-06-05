const ApiError = {
	notFound(message) { return { type: "API", reason: "NOT_FOUND", message, status: 404 } },
	notCreated(message) { return { type: "API", reason: "NOT_CREATED", message, status: 400 } },
	server(message) { return { type: "API", reason: "SERVER_ERROR", message, status: 500 } },
	badRequest(message) { return { type: "API", reason: "BAD_REQUEST", message, status: 400 } },
	validation(errors, message) { return { type: "API", reason: "VALIDATION", message, status: 400, errors } }
}

module.exports = ApiError
