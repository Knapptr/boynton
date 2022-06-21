const submitAwardView = require("./awardModal");
const submitPointsView= require("./pointsModal");

const registerViews = (app) => {
	app.view("boyntonAward", submitAwardView);
	app.view("awardPoints", submitPointsView);
};

module.exports = registerViews;
