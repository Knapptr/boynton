const registerActions = require("./actions/index");
const registerViews = require("./views/index");
const registerMessages = require("./messages/index");
const registerEvents = require("./events/index");
const registerShortcuts = require("./shortcuts/index");


const registerListeners = (app) => {
	registerActions(app);
	registerViews(app);
	registerEvents(app);
	registerMessages(app);
	registerShortcuts(app);
};

module.exports = registerListeners;
