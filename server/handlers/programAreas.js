const { body } = require("express-validator");
const ProgramArea = require("../../models/programArea");
const handleValidation = require("../../validation/validationMiddleware");
module.exports = {
  getAll: async (req, res, next) => {
    const programAreas = await ProgramArea.getAll();
    res.json(programAreas);
  },

  create: [
    body("areas").isArray(),
    body("areas.*.name").exists().trim().notEmpty(),
    handleValidation,
    async (req, res, next) => {
      const { areas } = req.body;
      const createdAreas = await ProgramArea.create(areas);
      res.json(createdAreas);
    }]
}
