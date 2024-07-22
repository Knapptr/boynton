const activityLocationHandler = require( "../handlers/activityLocation");

const activityLocationRouter = require("express").Router();

activityLocationRouter.get("/", activityLocationHandler.getAll);

module.exports = activityLocationRouter;
