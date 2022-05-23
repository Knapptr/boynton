const error = (message) => {
	if (Array.isArray(message)) {
		return {
			errors: message.map((msg) => {
				return { message: msg };
			}),
		};
	}
	return { errors: [{ message: message }] };
};

module.exports = error;

////test
//console.log(error("too many notes"));
//console.log(error(["too many notes", "not enought notes"]));
