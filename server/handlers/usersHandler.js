const User = require("../../models/User");
const usersHandler = {
  async getAll(req, res, next) {
    const users = await User.getAll();
    res.json(users);
  },
  async create(req, res, next) {
    console.log("User Create Body:", { body: req.body });
    const { username, password, role, firstName, lastName, staffable } = req.body;
    try {
      const user = await User.create({ username, password, role, firstName, lastName, staffable });
      res.sendStatus(200);

    } catch (e) {
      res.status(500);
      next(e);
    }
  },

  async delete(req, res, next) {
    const { username } = req.params;
    const user = await User.get(username);
    if (!user) { next(new Error("Cannot create user")) }
    try {
      const result = await user.delete();
      if (!result) { throw new Error("Error deleting user") }
      res.sendStatus(200);
    } catch (e) {
      next(e)
    }
  },

  async update(req, res, next) {
    const { username } = req.params;
    const user = await User.get(username);
    if (!user) { next(new Error("Cannot Delete: User does not exist")) }
    try {
      const result = await user.update(req.body);
      if (!result) { throw new Error("Error updating user") }
      res.json(result)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = usersHandler;
