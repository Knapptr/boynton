const giveAwardFromHome = require("./giveAward");
const awardPointsFromHome = require("./awardPoints");
const { sendCampers, sendProgramAreas } = require("./options");

const registerActions = (app) => {
	app.options("camper_options", sendCampers);
	app.action("giveAward", giveAwardFromHome);
	app.action("awardPoints", awardPointsFromHome);
};

module.exports = registerActions;
