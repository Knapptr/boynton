const { body, validationResult } = require("express-validator");
const Cabin = require("../../models/cabin");
const Config = require("../../models/config");
const User = require("../../models/User");
const handleValidation = require("../../validation/validationMiddleware");

module.exports = {
  create: [
    body("weeks").isArray(),
    body("weeks.*.number").isInt(),
    body("weeks.*.title").trim().notEmpty(),
    body("weeks.*.begins").trim().isDate({ format: "YYYY-MM-DD" }),
    body("weeks.*.ends").trim().isDate({ format: "YYYY-MM-DD" }),
    body("weeks.*.days").isArray(),
    body("weeks.*.days.*.name").trim().notEmpty(),
    body("weeks.*.days.*.periods").isInt(),
    body("users").isArray(),
    body("users.*.username").trim().notEmpty(),
    body("users.*.password").trim().notEmpty(),
    body("users.*.firstName").trim().notEmpty(),
    body("users.*.lastName").trim().notEmpty(),
    body("users.*.role").trim().notEmpty()
      .custom(role => {
        if (!User.VALID_ROLES.includes(role)) {
          throw new Error("invalid role")
        }
        return role;
      }),
    body("cabins").isArray(),
    body("cabins.*.name").trim().notEmpty(),
    body("cabins.*.capacity").isInt(),
    body("cabins.*.area").trim().custom(area => {
      if (!Cabin.VALID_AREAS.includes(area)) {
        throw new Error("Invalid cabin area")
      }
      return area
    }),
    body("programAreas").isArray(),
    body("programAreas.*.name").trim().notEmpty(),
    handleValidation,
    async (req, res, next) => {
      const config = await Config.load(req.body);
      console.log({ config });
      res.json(config);

    }
  ]
}
