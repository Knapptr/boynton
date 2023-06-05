const DbError = {
	alreadyExists(message) {
		console.error(message);
		return {
			type: "DB",
			reason: "Not Unique",
			message
		}
	},
	notFound(message) {
		console.error(message)
		return {
			type: "DB",
			reason: "Does not exsit",
			message
		}
	}
}

module.exports = DbError
