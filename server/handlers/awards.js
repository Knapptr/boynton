const { body } = require("express-validator");
const fs = require("fs");
const Award = require("../../models/award");
const PizZip = require("pizzip");
const Camper = require("../../models/camper");
const CamperWeek = require("../../models/camperWeek");
const ProgramArea = require("../../models/programArea");
const handleValidation = require("../../validation/validationMiddleware");
const { param } = require("../routers/awards");
const Week = require("../../models/week");

const TEMPLATEFILES = {
  "Challenge Activities": "challengeActivitiesAward_template.pptx",
  Waterfront: "waterfrontAward_template.pptx",
  "Creative Arts": "creativeArtsAward_template.pptx",
  Ropes: "ropesAward_template.pptx",
  Superstar: "superstarAward_template.pptx",
  "Polar Bear Dip": "polarBearDipAward_template.pptx",
  "Clean Cabin": "cleanCabinAward_template.pptx",
  Archery: "archeryAward_template.pptx",
};

module.exports = {
  getAll: async (req, res, next) => {
    const results = await Award.getAll();
    res.json(results);
  },

  getGrouped: async (req, res, next) => {
    const results = await Award.getGrouped();
    res.json(results);
  },

  create: [
    body("awards").isArray(),
    body("awards.*.camperSessionId")
      .isInt()
      .custom(async (camperSessionId) => {
        const session = await CamperWeek.getOne(camperSessionId);
        if (!session) {
          throw new Error("Camper session does not exist");
        }
      }),
    body("awards.*.programAreaId")
      .isInt()
      .custom(async (programAreaId) => {
        const programArea = await ProgramArea.getOne(programAreaId);
        if (!programArea) {
          throw new Error("Program Area does not exist");
        }
      }),
    body("awards.*.reason").exists(),
    handleValidation,
    async (req, res, next) => {
      const { awards } = req.body;
      const results = await Award.create(awards);
      res.json(results);
    },
  ],
  print: [
    param(":weekNumber")
      .isInt()
      .custom(async (wn) => {
        const week = await Week.get(wn);
        if (!week) {
          throw new Error("Invalid Week");
        }
        return wn;
      }),
    handleValidation,
    async (req, res, next) => {
      const { weekNumber } = req.params;
      const packagedFile = new PizZip();

      const awards = await Award.getGrouped(weekNumber);
      const awardTypes = Object.keys(awards);

      try {
        await Promise.all(
          awardTypes.map(async (awardType) => {
            const result = Promise.all(
              awards[awardType].map(async (award) => {
                const templateFileName = TEMPLATEFILES[awardType];
                const buffer = await award.toTemplateBuffer(templateFileName);
                packagedFile.file(
                  `${award.camperFirstName}_${award.camperLastName}_${award.reason}.pptx`,
                  buffer
                );
                return "done";
              })
            );
            return result;
          })
        );
        const content = packagedFile.generate({ type: "nodebuffer" });
        res.attachment("awardsnew.zip");
        res.send(content);
        return;
      } catch (e) {
        next(e);
      }
    },
  ],
};
