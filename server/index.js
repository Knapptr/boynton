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
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const apiRouter = require("./routers/api");
const express = require("express");
const path = require("path");
const authRouter = require("./routers/auth");

const receiver = new ExpressReceiver({
	signingSecret: process.env.SIGNING_SECRET,
});

receiver.router.use(express.json());
receiver.router.use(express.urlencoded({ extended: true }));
receiver.router.use(
	express.static(path.join(__dirname, "..", "frontend", "build"))
);

//create middleware for JWT
const checkJwt = jwt({
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `https://dev-lgy8aa8a.us.auth0.com/.well-known/jwks.json`,
	}),
	audience: "boynton_api",
	issuer: "https://dev-lgy8aa8a.us.auth0.com/",
	algorithms: ["RS256"],
});

// receiver.router.get("/testauth", checkJwt, (req, res) => {
// 	res.json({ secret: req.user });
// });

receiver.router.get("/", (req, res) => {
	console.log("request made");
});
receiver.router.use("/auth", authRouter);
receiver.router.use("/api", apiRouter);

receiver.router.get("*", (req, res, next) => {
	res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
});

module.exports = receiver;
