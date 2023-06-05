const User = require("../../models/User");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");
const usersHandler = {
  async getAll(req, res, next) {
    const users = await User.getAll();
    res.json(users);
  },

  async get(req, res, next) {
    {
      const { username } = req.params;
      const user = await User.get(username.trim());
      if (!user) { next(ApiError.notFound("User not found")); return; }
      res.json(user);
    }
  },

  async create(req, res, next) {
    const { username, password, role, firstName, lastName, lifeguard, senior, firstYear, archery, ropes, sessions } = req.body;
    try {
      const user = await User.create({ username, password, role, firstName, lastName, lifeguard, archery, senior, firstYear, ropes, sessions });
      res.status(201).json(user);

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
    // check all fields
    console.log({ updateBody: req.body })
    const { role, senior, firstYear, firstName, lastName, ropes, lifeguard, archery } = req.body;
    if (role === undefined || senior === undefined || firstYear === undefined || firstName === undefined || lastName === undefined || ropes === undefined || lifeguard === undefined || archery === undefined) {
      next(ApiError.badRequest("Missing fields for user"));
      return;
    }
    const user = await User.get(username);
    console.log({ user });
    if (!user) { next(DbError.notFound("User does not exist")); return; }
    try {
      const result = await user.update(req.body);
      if (!result) { throw new Error("Error updating user") }
      res.json(result)
      return;
    } catch (e) {
      next(e)
    }
  },

  async weekSchedule(req, res, next) {
    const { username, weekNumber } = req.params;
    const scheduleResponse = await User.weekSchedule(username, weekNumber);
    if (!scheduleResponse) { next(ApiError.notFound("User or UserSession not found")); return; }
    res.json(scheduleResponse);

  }
}

module.exports = usersHandler;
