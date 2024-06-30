const router = require("express").Router();
const { param, body } = require("express-validator");
const Camper = require("../../models/camper");
const handleValidation = require("../../validation/validationMiddleware");
const { sendToCamperInfo } = require("../../slackMessages");

const areaToGender = {
  BA: "Male",
  GA: "Female",
};
const handler = {
  async getAllCampers(req, res, next) {
    let campers = await Camper.getAll();
    if (req.query.area) {
      const area = req.query.area.toUpperCase();
      campers = campers.filter(
        (camper) => camper.gender === areaToGender[area]
      );
    }
    if (req.query.week) {
      const week = Number.parseInt(req.query.week);
      campers = campers.filter((camper) =>
        camper.weeks.some((session) => session.number === week)
      );
    }
    if (req.query.cabin) {
      const cabin = req.query.cabin;
      const week = Number.parseInt(req.query.week);

      campers = campers.filter((camper) =>
        camper.weeks.some((session) => {
          return week
            ? session.cabinName === cabin && session.number === week
            : session.cabinName === cabin;
        })
      );
    }
    res.json(campers);
  },
  getOneCamper: [
    param("camperID")
      .exists()
      .isInt()
      .custom(async (value, { req }) => {
        let camper = await Camper.getById(value).catch((e) => console.log(e));
        if (!camper) {
          throw new Error("Camper does not exist");
        }
        req.camper = camper;
      }),
    handleValidation,
    async (req, res, next) => {
      res.json(req.camper);
    },
  ],
  setPronouns: [
    param("camperID")
      .exists()
      .isInt()
      .custom(async (value, { req }) => {
        let camper = await Camper.getById(value).catch((e) => console.log(e));
        if (!camper) {
          throw new Error("Camper does not exist");
        }
        req.camper = camper;
      }),

    body("pronouns").exists().isString().trim(),
    handleValidation,
    async (req, res, next) => {
      const camper = req.camper;
      const { user } = req;
      const { pronouns } = req.body;
      try {
        await camper.setPronouns(pronouns);
        res.send("ok");
        // SLACK
        if (pronouns.length > 0) {
          const message = {
            blocks: [
              {
                type: "divider",
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*${camper.firstName} ${camper.lastName}* uses _${pronouns}_ pronouns`,
                },
              },
              {
                type: "divider",
              },
              {
                type: "context",
                elements: [
                  {
                    type: "plain_text",
                    text: `${user.firstName} ${user.lastName[0]}.`,
                    emoji: true,
                  },
                ],
              },
            ],
          };
          sendToCamperInfo(message);
        }
        // /SLACK
        return;
      } catch (e) {
        console.log(e);
        res.status(500);
        res.send("Error");
        return;
      }
    },
  ],
};

module.exports = handler;
