const authenticate = require("../../utils/authenticate");
const error = require("../../utils/jsonError");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const handleValidation = require("../../validation/validationMiddleware");
const { body } = require("express-validator");

module.exports = {
  login: [
    body("username").exists().trim().notEmpty(),
    body("password").exists().trim().notEmpty(),
    handleValidation,
    async (req, res) => {
      const { username, password } = req.body;
      const authResponse = await User.authenticate({
        username,
        password,
      });
      if (!authResponse) {
        res.status(401);
        res.json(error("Not authorized"));
        return;
      }
      const { user, isAuthenticated } = authResponse;
      // console.log({ isAuthenticated });
      if (!isAuthenticated) {
        res.status(401);
        res.json(error("Not authorized"));
        return;
      }
      //give json token
      const token = jwt.sign(
        { username: user.username, role: user.role },
        process.env.JWT_SECRET
      );
      const userInfo = {
        username: user.username,
        role: user.role,
      };
      res.json({ token, user: userInfo });
    },
  ],
  create: [
    body("createSecret").trim().notEmpty().equals(process.env.CREATE_SECRET),
    body("users").isArray().notEmpty(),
    body("users.*.username").exists().trim().notEmpty(),
    body("users.*.password").exists().trim().notEmpty(),
    body("users.*.firstName").exists().trim().notEmpty(),
    body("users.*.lastName").exists().trim().notEmpty(),
    body("users.*.lifeguard").optional().isBoolean(),
    body("users.*.archery").optional().isBoolean(),
    body("users.*.ropes").optional().isBoolean(),
    body("users.*.firstYear").optional().isBoolean(),
    body("users.*.senior").optional().isBoolean(),
    body("users.*.role")
      .exists()
      .trim()
      .notEmpty()
      .custom((role) => {
        if (!User.VALID_ROLES.includes(role)) {
          throw new Error("Invalid User Role");
        }
        return role;
      }),
    handleValidation,
    async (req, res, next) => {
      try {
        const createdUsers = await User.createMany(req.body.users);
        res.json(createdUsers);
      } catch (e) {
        next(e);
      }
    },
  ],
};
