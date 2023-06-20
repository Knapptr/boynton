const authenticate = require("../../utils/authenticate");
const error = require("../../utils/jsonError");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const handleValidation = require("../../validation/validationMiddleware");
const { body,param } = require("express-validator");

const KEY_TTL = "7d";

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
        process.env.JWT_SECRET,
        {expiresIn: KEY_TTL}
      );
      const userInfo = {
        username: user.username,
        role: user.role,
      };
      res.json({ token, user: userInfo });
    },
  ],
  create: [
    param("signUpToken").custom(async(token)=>{
        try{jwt.verify(token,process.env.SIGNUP_LINK_SECRET)}catch(e){
            throw new Error("This is not a valid sign-up link. See an administrator")
        }
    }),
    body("users").isArray().notEmpty(),
    body("users.*.username").exists().trim().notEmpty().custom(async (username)=>{
      // check if user exists
      const user = await User.get(username);
      if(user){
        throw new Error("User already exists")
      }
      return username;
    }),
    body("users.*.password").exists().trim().isLength({min:7}).withMessage("password must be at least 7 characters"),
    body("users.*.firstName").exists().trim().notEmpty(),
    body("users.*.lastName").exists().trim().notEmpty(),
    body("users.*.lifeguard").optional().isBoolean(),
    body("users.*.archery").optional().isBoolean(),
    body("users.*.ropes").optional().isBoolean(),
    body("users.*.firstYear").optional().isBoolean(),
    body("users.*.senior").optional().isBoolean(),
    handleValidation,
    async (req, res, next) => {
      console.log({b:{...req.body}})
      const role = "counselor" // counselor by default
      try {
        const createdUsers = await User.createMany(req.body.users.map(u=>({...u,role})));
        res.json(createdUsers);
      } catch (e) {
        next(e);
      }
    },
  ],
};
