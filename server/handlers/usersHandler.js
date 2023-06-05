const { body, validationResult } = require("express-validator");
const User = require("../../models/User");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");
const userValidation = require("../../validation/user");

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


  create: [
    userValidation.validateUsername(),
    userValidation.validateNameField("firstName"),
    userValidation.validateNameField("lastName"),
    userValidation.validatePassword(),
    handleValidation, async (req, res, next) => {
      const { username, password, role, firstName, lastName, lifeguard, senior, firstYear, archery, ropes, sessions } = req.body;
      try {
        const user = await User.create({ username, password, role, firstName, lastName, lifeguard, archery, senior, firstYear, ropes, sessions });
        res.status(201).json(user);

      } catch (e) {
        res.status(500);
        next(e);
      }
    }],

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

  update: [
    userValidation.validateBooleanField("lifeguard"),
    userValidation.validateBooleanField("senior"),
    userValidation.validateBooleanField("firstYear"),
    userValidation.validateBooleanField("ropes"),
    userValidation.validateBooleanField("lifeguard"),
    userValidation.validateBooleanField("archery"),
    async (req, res, next) => {
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
    }],

  async weekSchedule(req, res, next) {
    const { username, weekNumber } = req.params;
    const scheduleResponse = await User.weekSchedule(username, weekNumber);
    if (!scheduleResponse) { next(ApiError.notFound("User or UserSession not found")); return; }
    res.json(scheduleResponse);

  }
}

const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  next(ApiError.validation(result.errors, "Invalid fields."))
}

module.exports = usersHandler;
