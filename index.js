require("dotenv").config();
// slack integration
// const registerListeners = require("./slack/listeners/index");
const { App, ExpressReceiver } = require("@slack/bolt");
const receiver = require("./server/index");
const dbInit = require('./db.init');
const port = process.env.PORT || 3000

const app = new App({
	token: process.env.BOT_TOKEN,
	receiver: receiver,
	// signingSecret: process.env.SIGNING_SECRET,
	appToken: process.env.APP_TOKEN,
	port: port
});

// Slack integration
// registerListeners(app);

console.log("Starting Boynton . . .");
(async () => {
	try {
		await dbInit();
		await app.start(port)
		console.log(`listening on port ${port}`);
	} catch (e) {
		console.log("Could not start:")
		console.log(e);
	}
})();
