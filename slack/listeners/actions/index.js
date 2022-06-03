const giveAwardFromHome = require("./giveAward");
const { sendCampers } = require("./options");

const registerActions = (app) => {
	app.options("camper_options", sendCampers);
	app.action("giveAward", giveAwardFromHome);
};

module.exports = registerActions;
