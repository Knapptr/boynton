const Week = require("../../models/week");
const CabinSession = require("../../models/cabinSession");
const Camper = require("../../models/camper");
const handleValidation = require("../../validation/validationMiddleware");
const { param, body } = require("express-validator");
const Score = require("../../models/score");
const ActivitySession = require("../../models/activitySession");
const { validateWeekParam } = require("../../validation/scores");
const { validateUserSessionList } = require("../../validation/user");
const StaffSession = require("../../models/staffSession");

const weekHandler = {
  getHeaders: [
    param("weekNumber")
      .exists()
      .isInt()
      .custom(async (weekNumber, { req }) => {
        const week = await Week.get(weekNumber, getStaff);
        if (!week) {
          throw new Error("Week does not exist");
        }
        req.week = week;
      }),
    handleValidation,
    async (req, res, next) => {
      const week = req.week;
      const { number, display, title, begins, ends } = week;
      const data = { number, display, title, begins, ends };
      res.json(data);
    },
  ],
  getThumbs: [
    param("weekNumber")
      .exists()
      .isInt()
      .custom(async (weekNumber, { req }) => {
        const getStaff = req.query.staff === "true";
        const week = await Week.get(weekNumber, getStaff);
        if (!week) {
          throw new Error("Week does not exist");
        }
        req.week = week;
      }),
    handleValidation,
    async (req, res, next) => {
      const { week } = req;
      const thumbsData = await week.getThumbs();
      res.json(thumbsData);
    },
  ],

  async getAll(req, res, next) {
    const getStaff = req.query.staff === "true";
    const weeks = await Week.getAll(getStaff);
    res.status(200).json(weeks);
  },
  getCurrent: async (req, res, next) => {
    const date = new Date();
    const week = await Week.getOnDate(date);
    if (!week) {
      next(new Error("No Current Week"));
      return;
    }
    res.json(week);
  },
  getWeeklyCapacityInfo: [
    param("weekNumber").exists().isInt(),
    handleValidation,
    async (req, res, next) => {
      const { weekNumber } = req.params;
      const sessions = await ActivitySession.getCapacityActs(weekNumber);
      if (!sessions) {
        res.sendStatus(404);
        return;
      }
      res.json(sessions);
    },
  ],
  getScores: [
    param("weekNumber")
      .isInt()
      .custom(async (weekNumber, { req }) => {
        const week = Week.get(weekNumber);
        if (!week) {
          throw new Error("Invalid Week");
        }
        return weekNumber;
      }),
    handleValidation,
    async (req, res, next) => {
      const data = await Score.getForWeek(req.params.weekNumber);
      // console.log({ data });
      res.json(data);
    },
  ],
  getOne: [
    param("weekNumber")
      .exists()
      .isInt()
      .custom(async (weekNumber, { req }) => {
        const getStaff = req.query.staff === "true";
        const week = await Week.get(weekNumber, getStaff);
        if (!week) {
          throw new Error("Week does not exist");
        }
        req.week = week;
      }),
    handleValidation,
    async (req, res, next) => {
      const week = req.week;
      res.json(week);
    },
  ],
  async getCabinSessions(req, res, next) {
    const weekNumber = req.params.weekNumber;
    let list = await CabinSession.getForWeek(weekNumber);
    if (req.query.area && ["BA", "GA"].includes(req.query.area.toUpperCase())) {
      list = list.filter(
        (c) => c.area.toUpperCase() === req.query.area.toUpperCase()
      );
    }
    res.json(list);
  },

  async clearCabins(req, res, next) {
    const { weekNumber } = req.params;
    // Area can be "BA" or "GA"
    const area = req.query.area;
    const week = await Week.get(weekNumber);
    const response = await week.clearCabins(area);
    res.json(response);
  },

  getCampers: [
    param("weekNumber").isInt(),
    handleValidation,
    async (req, res, next) => {
      const { weekNumber } = req.params;
      const campers = await Camper.getByWeek(weekNumber);
      res.json(campers);
    },
  ],
  assignStaffToPeriodNumber: [
    param("weekNumber").toInt(),
    body("periodNumber")
      .custom((pn) => Number.parseInt(pn))
      .isInt(),
    validateWeekParam(), //populates req.week if valid
    (req, res, next) => {
      // console.log({ week: req.week });
      req.staffList = [];
      next();
    },
    validateUserSessionList("staffSessions.*.id"),
    handleValidation,
    async (req, res, next) => {
      const week = req.week;
      const staffSessionList = req.staffList;
      const { periodNumber } = req.body;
      try {
        const result = await week.assignStaffToPeriodNumber(
          periodNumber,
          staffSessionList
        );
        // console.log({ result });
        res.json(result);
      } catch (e) {
        // console.log("Error",e);
        res.status(404);
        res.send(e);
      }
    },
  ],
  unassignStaffToPeriodNumber: [
    param("weekNumber").toInt(),
    body("periodNumber")
      .custom((pn) => Number.parseInt(pn))
      .isInt(),
    validateWeekParam(), //populates req.week if valid
    (req, res, next) => {
      // console.log({ week: req.week });
      req.staffList = [];
      next();
    },
    validateUserSessionList("staffSessions.*.id"),
    handleValidation,
    async (req, res, next) => {
      const week = req.week;
      const staffSessionList = req.staffList;
      const { periodNumber } = req.body;
      try {
        const result = await week.unassignStaffToPeriodNumber(
          periodNumber,
          staffSessionList
        );
        // console.log({ result });
        res.json(result);
      } catch (e) {
        // console.log("Error",e);
        res.status(404);
        res.send(e);
      }
    },
  ],
  // getWeekCampers: [
  // 	param.
  // 	handleValidation,
  // 	async(req, res, next)=> {
  // 	const weekID = req.params.number;
  // 	const week = await Week.get(weekID);
  // 	const campers = await week.getCampers(true);

  // 	res.json(campers);
  // }],
  // async getWeekPeriods(req, res, next) {
  // 	const weekID = req.params.number;
  // 	const periods = await Period.getForWeek(weekID);
  // 	res.json(periods);
  // },
  // async getDayPeriods(req, res, next) {
  // 	const allowedDays = ["MON", "TUE", "WED", "THU", "FRI"];
  // 	const weekID = req.params.number;
  // 	const dayName = req.params.day.toUpperCase();
  // 	if (!allowedDays.includes(dayName)) {
  // 		res.json(error("Days are 3 letters, eg: MON, TUE etc"));
  // 		return;
  // 	}
  // 	const day = await Day.getByWeekAndName(weekID, dayName);
  // 	const periods = await Period.getForDay(day.id);
  // 	res.json(periods);
  // },
  // async getPeriodActivities(req, res, next) {
  // 	const periodID = req.params.periodID;
  // 	const period = await Period.get(periodID);
  // 	if (!period) {
  // 		res.json(error(`Period does not exist: ${periodID}`));
  // 		return;
  // 	}
  // 	const activities = await period.getActivities();
  // 	res.json(activities);
  // },
  // async getUnsignedCampers(req, res, next) {
  // 	const weekID = req.params.number;
  // 	const periodID = req.params.periodID;
  // 	const period = await Period.get(periodID);
  // 	const campers = await period.getUnSignedUpCampers(weekID);
  // 	res.json(campers);
  // },
  // async getSignedCampers(req, res, next) {
  // 	const weekID = req.params.number;
  // 	const periodID = req.params.periodID;
  // 	const period = await Period.get(periodID);
  // 	const campers = await period.getSignedUpCampers(weekID);
  // 	res.json(campers);
  // },
  // async getUnsignedByCabin(req, res, next) {
  // 	const weekID = req.params.number;
  // 	const periodID = req.params.periodID;
  // 	const period = await Period.get(periodID);
  // 	const campers = await period.getUnSignedUpCampers(weekID, cabin);
  // 	res.json(campers);
  // },
};

module.exports = weekHandler;
