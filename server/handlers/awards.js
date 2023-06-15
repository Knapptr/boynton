const { body } = require("express-validator");
const Award = require("../../models/award");
const Camper = require("../../models/camper");
const CamperWeek = require("../../models/camperWeek");
const ProgramArea = require("../../models/programArea");
const handleValidation = require("../../validation/validationMiddleware");

module.exports = {
  getAll: async (req, res, next) => {
    const results = await Award.getAll();
    res.json(results);
  },

  create: [
    body("awards").isArray(),
    body("awards.*.camperSessionId").isInt().custom(async (camperSessionId) => {
      const session = await CamperWeek.getOne(camperSessionId);
      if (!session) {
        throw new Error("Camper session does not exist");
      }
    }),
    body("awards.*.programAreaId").isInt().custom(async (programAreaId) => {
      const programArea = await ProgramArea.getOne(programAreaId);
      if (!programArea) {
        throw new Error("Program Area does not exist");
      }
    }),
    body("awards.*.reason").exists(),
    handleValidation,
    async (req, res, next) => {
      const { awards } = req.body;
      const results = await Award.create(awards);
      res.json(results);
    }]
}


