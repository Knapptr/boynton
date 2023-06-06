const DbError = {
	alreadyExists(message) {
		return {
			type: "DB",
			reason: "Not Unique",
			message
		}
	},
	notFound(message) {
		return {
			type: "DB",
			reason: "Does not exsit",
			message
		}
	},
	transactionFailure(message) {
		return {
			type: "DB",
			reason: "Transaction failed",
			message
		}
	}
}

module.exports = DbError
