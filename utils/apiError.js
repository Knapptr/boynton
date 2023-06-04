const ApiError = {
	notFound(message) { return { type: "API", message, status: 404 } },
	notCreated(message) { return { type: "API", message, status: 400 } },
	server(message) { return { type: "API", message, status: 500 } }
}

module.exports = ApiError
