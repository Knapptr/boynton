const { ExpressReceiver } = require("@slack/bolt");
const apiRouter = require("./routers/api");
const express = require("express");
const path = require("path");
const authRouter = require("./routers/auth");
const cors = require('cors');
const awardsHandler = require("./handlers/awards");
// const actionRouter = require('./routers/action');
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

receiver.router.get("/",(req,res,next)=>{
	res.status(200);
	res.send("knapptr@gmail.com")
})
receiver.router.use("/auth", authRouter);
// receiver.router.use("/action", actionRouter);
receiver.router.use("/api", apiRouter);

// receiver.router.get("/*", (req, res, next) => {
// 	res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
// });
// receiver.router.get("/*", (req, res, next) => {
// 	res.sendFile(path.join(__dirname, "..", "frontend", "build", "404.html"));
// });

module.exports = receiver;
