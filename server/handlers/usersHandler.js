const { body, validationResult, param } = require("express-validator");
const User = require("../../models/User");
const ApiError = require("../../utils/apiError");
const DbError = require("../../utils/DbError");
const handleValidation = require("../../validation/validationMiddleware");
const userValidation = require("../../validation/user");
const Week = require("../../models/week");

const usersHandler = {
  async getAll(req, res, next) {
    const users = await User.getAll();
    res.json(users);
  },

  get: [
    param("username").exists().trim().custom(async (username, { req }) => {
      const user = await User.get(username);
      if (!user) {
        throw new Error("User does not exist");
      }
      req.routeUser = user;
    }),
    handleValidation,
    async (req, res, next) => {
      {
        res.json(req.routeUser);
      }
    }],


  create: [
    userValidation.validateUsername(),
    userValidation.validateNameField("firstName"),
    userValidation.validateNameField("lastName"),
    userValidation.validatePassword(),
    userValidation.validateOptionalSessions(),
    userValidation.validateUniqueUser(),
    handleValidation,
    async (req, res, next) => {
      const { username, password, role, firstName, lastName, lifeguard, senior, firstYear, archery, ropes, sessions } = req.body;
      try {
        const user = await User.create({ username, password, role, firstName, lastName, lifeguard, archery, senior, firstYear, ropes, sessions });
        console.log({createdUser:user});
        res.status(201).json(user);
        return;

      } catch (e) {
        res.status(500);
        next(e);
      }
    }],

  delete: [
    param("username").exists().trim().custom(async (username, { req }) => {
      const user = await User.get(username);
      if (!user) {
        throw new Error("User does not exist");
      }
      req.routeUser = user;
    }),
    handleValidation,
    async (req, res, next) => {
      const { username } = req.params;
      const user = req.routeUser
      try {
        const result = await user.delete();
        if (!result) { next(DbError.notFound("Could not delete user")) }
        res.json(result);
      } catch (e) {
        next(e)
      }
    }],

  update: [
    userValidation.validateUsername(),
    userValidation.validateUserParamExists(),
    userValidation.validateRole(),
    userValidation.validateBooleanField("lifeguard"),
    userValidation.validateBooleanField("senior"),
    userValidation.validateBooleanField("firstYear"),
    userValidation.validateBooleanField("ropes"),
    userValidation.validateBooleanField("lifeguard"),
    userValidation.validateBooleanField("archery"),
    userValidation.validateUpdateUsernameUnique(),
    handleValidation,
    async (req, res, next) => {
      // check all fields
      const user = req.body.targetUser;
      try {
        const result = await user.update(req.body);
        if (!result) { throw new Error("Error updating user") }
        res.json(result)
        return;
      } catch (e) {
        next(e)
      }
    }],

  weekSchedule: [
    param("username").exists().custom(async (username) => {
      const user = await User.get(username);
      if (!user) {
        throw new Error("User does not exist");
      }
    }),
    param("weekNumber").exists().isInt().custom(async (weekNumber) => {
      const week = await Week.get(weekNumber);
      if (!week) {
        throw new Error("Week does not exist");
      }
    }),
    handleValidation,
    async (req, res, next) => {
      const { username, weekNumber } = req.params;
      const scheduleResponse = await User.weekSchedule(username, weekNumber);
      if (!scheduleResponse) { next(ApiError.notFound("User not scheduled for week")); return; }
      res.json(scheduleResponse);

    }]
}

module.exports = usersHandler;
