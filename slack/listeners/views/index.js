const submitAwardView = require("./awardModal");

const registerViews = (app) => {
	app.view("boyntonAward", submitAwardView);
};

module.exports = registerViews;
