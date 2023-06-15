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
      if (!authResponse) { res.status(401); res.json(error('Not authorized')); return; }
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
    }],
  create: [
    body("username").exists().trim().notEmpty(),
    body("password").exists().trim().notEmpty(),
    body("role").exists().trim().notEmpty(),
    handleValidation,
    async (req, res) => {
      const { username, password, role } = req.body;
      try {
        const user = await User.create({ username, password, role });
        res.json({ username: user.username, role: user.role });
      } catch (e) {
        res.status(500);
        res.send(e.message);
      }
    }],
};
