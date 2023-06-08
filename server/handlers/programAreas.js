const ProgramArea = require("../../models/programArea");
module.exports = {
  getAll: async (req, res, next) => {
    const programAreas = await ProgramArea.getAll();
    res.json(programAreas);
  },

  create: async (req, res, next) => {
    const { areas } = req.body;
    const createdAreas = await ProgramArea.create(areas);
    res.json(createdAreas);
  }
}
