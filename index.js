require("dotenv").config();
const registerListeners = require("./slack/listeners/index");
const { App, ExpressReceiver } = require("@slack/bolt");
const Awarder = require("./features/Awards/Awarder");
const receiver = require("./server/index");
const dbInit = require('./db.init');
const port = process.env.PORT || 3000
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
    await dbInit();
		await app.start(port)
		console.log(`listening on port ${port}`);
	} catch (e) {
		console.log(e);
	}
})();
