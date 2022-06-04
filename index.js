require("dotenv").config();
const registerListeners = require("./slack/listeners/index");
const { App, ExpressReceiver } = require("@slack/bolt");
const Awarder = require("./features/Awards/Awarder");
const receiver = require("./server/index");

const app = new App({
	token: process.env.BOT_TOKEN,
	receiver: receiver,
	// signingSecret: process.env.SIGNING_SECRET,
	appToken: process.env.APP_TOKEN,
	port: 3000,
});

registerListeners(app);

(async () => {
	try {
		await app.start(3000);
		console.log("listening on port 3000");
	} catch (e) {
		console.log(e);
	}
})();