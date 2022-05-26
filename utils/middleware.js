const error = require("./jsonError");

const middleware = {
	notImplemented(req, res, next) {
		res.json(error("NOT IMPLEMENTED"));
	},
};

module.exports = middleware;
