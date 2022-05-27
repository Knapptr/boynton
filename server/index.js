const { ExpressReceiver } = require("@slack/bolt");
const Camper = require("../models/camper");
const camperRouter = require("./routers/campers");
const weekRouter = require("./routers/weeks");
const cabinRouter = require("./routers/cabins");
const camperWeekRouter = require("./routers/camperWeeks");
const cabinSessionRouter = require("./routers/cabinSession");
const daysRouter = require("./routers/days");
const periodRouter = require("./routers/period");
const activityRouter = require("./routers/activity");
const apiRouter = require("./routers/api");
const express = require("express");
const path = require("path");

const receiver = new ExpressReceiver({
	signingSecret: process.env.SIGNING_SECRET,
});
receiver.router.use(express.json());
receiver.router.use(
	express.static(path.join(__dirname, "..", "frontend", "build"))
);

receiver.router.get("/", (req, res) => {
	console.log("request made");
});
receiver.router.get("/serveTest", (req, res, next) => {
	res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
});
receiver.router.use("/api", apiRouter);

module.exports = receiver;
