const staffSessions = require("express").Router();
const staffSessionHandler = require("../handlers/staffSessions");

staffSessions.get("/:id", staffSessionHandler.getSession)
staffSessions.post("/:id/cabin",staffSessionHandler.assignToCabin);
staffSessions.get("/period/:periodId", staffSessionHandler.getAssignedPeriod);

module.exports = staffSessions
