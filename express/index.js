const { ExpressReceiver } = require("@slack/bolt");
const Camper = require("../models/camper");
const camperRouter = require("./routers/campers");
const weekRouter = require("./routers/weeks");

const receiver = new ExpressReceiver({
	signingSecret: process.env.SIGNING_SECRET,
});

receiver.router.get("/", (req, res) => {
	console.log("request made");
});
receiver.router.use("/campers", camperRouter);
receiver.router.use("/weeks", weekRouter);

module.exports = receiver;
