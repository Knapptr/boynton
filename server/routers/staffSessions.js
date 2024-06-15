const staffSessions = require("express").Router();
const staffSessionHandler = require("../handlers/staffSessions");

staffSessions.get("/:id", staffSessionHandler.getSession)
staffSessions.get("/period/:periodId/viable", staffSessionHandler.getDailyUnassigned)

module.exports = staffSessions
