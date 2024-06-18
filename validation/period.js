const { param } = require("express-validator");
const Period = require("../models/period");

const periodValidation = {
  periodValidateAndPopulate: (idFieldName) =>
    param(idFieldName)
      .isInt()
      .custom(async (id, { req }) => {
        const period = await Period.get(id);
        if (!period) {
          throw new Error("Period not found");
        }
        req.period = period;
      }),
};

module.exports = periodValidation;
