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
const express = require("express");

const receiver = new ExpressReceiver({
	signingSecret: process.env.SIGNING_SECRET,
});
receiver.router.use(express.json());

receiver.router.get("/", (req, res) => {
	console.log("request made");
});
receiver.router.use("/activities", activityRouter);
receiver.router.use("/campers", camperRouter);
receiver.router.use("/periods", periodRouter);
receiver.router.use("/days", daysRouter);
receiver.router.use("/cabin-sessions", cabinSessionRouter);
receiver.router.use("/cabins", cabinRouter);
receiver.router.use("/camper-weeks", camperWeekRouter);
receiver.router.use("/weeks", weekRouter);

module.exports = receiver;
