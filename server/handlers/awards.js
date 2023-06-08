const Award = require("../../models/award");

module.exports = {
  getAll: async (req, res, next) => {
    const results = await Award.getAll();
    res.json(results);
  },

  create: async (req, res, next) => {
    const { awards } = req.body;
    const results = await Award.create(awards);
    res.json(results);
  }
}


