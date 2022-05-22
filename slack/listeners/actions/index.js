const giveAwardFromHome = require("./giveAward");
const sendOptions = require("./options");
const view = require("../../views/modals/createAwards");

const registerActions = (app) => {
	app.options("camper_options", sendOptions);
	app.action("giveAward", giveAwardFromHome);
	app.action("flEval", async ({ ack }) => {
		await ack();
	});
};

module.exports = registerActions;
