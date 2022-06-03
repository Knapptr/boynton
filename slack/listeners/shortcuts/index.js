const boyntonAward = require("./boyntonAward");
const printAward = require("./printAwards");

const registerShortcuts = (app) => {
	app.shortcut("boyntonAward", boyntonAward);
	app.shortcut("printAwards", printAward);
};

module.exports = registerShortcuts;
