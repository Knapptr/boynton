const DbError = {
	alreadyExists(message) {
		console.log(message);
		return {
			type: "DB",
			reason: "Not Unique",
			message
		}
	}
}

module.exports = DbError
