const ApiError = {
	notFound(message) { return { message, status: 404 } },
	notCreated(message) { return { message, status: 400 } },
	server(message) { return { message, status: 500 } }
}

module.exports = ApiError
