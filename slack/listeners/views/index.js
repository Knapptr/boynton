const submitPointsView= require("./pointsModal");

const registerViews = (app) => {
	app.view("awardPoints", submitPointsView);
};

module.exports = registerViews;
