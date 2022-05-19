const openHome = require("./openHome");
const registerEvents = (app) => {
	app.event("app_home_opened", openHome);
};

module.exports = registerEvents;
