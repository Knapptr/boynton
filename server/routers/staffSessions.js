const staffSessions = require("express").Router();
const staffSessionHandler = require("../handlers/staffSessions");

staffSessions.get("/:id", staffSessionHandler.getSession)
staffSessions.post("/:id/cabin",staffSessionHandler.assignToCabin);
staffSessions.post("/:id/thumbs",staffSessionHandler.addThumbs);
staffSessions.delete("/:id/thumbs",staffSessionHandler.removeThumbs);
staffSessions.get("/period/:periodId", staffSessionHandler.getAssignedPeriod);

module.exports = staffSessions
