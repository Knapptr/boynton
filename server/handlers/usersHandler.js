const User = require("../../models/User");
const usersHandler = {
  async getAll(req, res, next) {
    const users = await User.getAll();
    res.json(users);
  },
  async create(req, res, next) {
    const { username, password, role, firstName, lastName } = req.body;
    try {
      const user = await User.create({ username, password, role, firstName, lastName });
      res.sendStatus(200);

    } catch (e) {
      res.status(500);
      next(e);
    }
  }
}

module.exports = usersHandler;
