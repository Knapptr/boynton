const { ExpressReceiver } = require("@slack/bolt");
const apiRouter = require("./routers/api");
const docRouter = require("./routers/docs");
const express = require("express");
const authRouter = require("./routers/auth");
const rootRouter = require("./routers/root");
const cors = require('cors');

const passport = require("passport");
require("./auth")(passport);


const receiver = new ExpressReceiver({
	signingSecret: process.env.SIGNING_SECRET,
});

receiver.router.use(cors());
receiver.router.use(express.json());
receiver.router.use(express.urlencoded({ extended: true }));
// receiver.router.use(
// 	express.static(path.join(__dirname, "..", "frontend", "build"))
// );

receiver.router.use("/auth", authRouter);
receiver.router.use("/docs",docRouter);
// receiver.router.use("/action", actionRouter);
receiver.router.use("/api", apiRouter);
receiver.router.use("/", rootRouter);

// receiver.router.get("/*", (req, res, next) => {
// 	res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
// });
// receiver.router.get("/*", (req, res, next) => {
// 	res.sendFile(path.join(__dirname, "..", "frontend", "build", "404.html"));
// });

module.exports = receiver;
