//raw queries should be refactored into the repo model for each table-but I'm in a rush
//they are 'mocked' into repos here for the init funciton

const queries = require("./initQueries");
const { fetchOne } = require("./utils/pgWrapper");
const init = (query) => {
  return async () => {
    try {
      await fetchOne(query);
      return true;
    } catch (e) {
      throw new Error(`can not init with query: ${query}`)
    }
  };
};
const activityRepo = { init: init(queries.activities) };
const cabinSessionRepo = { init: init(queries.cabinSessions) };
const cabinRepo = { init: init(queries.cabins) };
const camperActivityRepo = { init: init(queries.camperActivities) };
const camperWeekRepo = { init: init(queries.camperWeeks) };
const userRepo = require("./repositories/User");
const camperRepo = require("./repositories/camper");
const dayRepo = require("./repositories/day");
const periodRepo = require("./repositories/period");
const scoreRepo = require("./repositories/score");
const weekRepo = require("./repositories/week");

//order matters here
const repos = [
  weekRepo,
  dayRepo,
  periodRepo,
  activityRepo,
  cabinRepo,
  cabinSessionRepo,
  camperRepo,
  camperWeekRepo,
  camperActivityRepo,
  userRepo,
  scoreRepo,
];

module.exports = async () => {
  try {
    await Promise.all(repos.map((r) => r.init()));
    console.log('db initialized');
  } catch (e) {
    throw new Error("Error with db init");
  }

  // weekRepo
  //   .init()
  //   .then(() => dayRepo.init())
  //   .then(() => periodRepo.init())
  //   .then(() => activityRepo.init())
  //   .then(() => cabinRepo.init())
  //   .then(() => cabinSessionRepo.init())
  //   .then(() => camperRepo.init())
  //   .then(() => camperWeekRepo.init())
  //   .then(() => camperActivityRepo.init())
  //   .then(() => userRepo.init())
  //   .then(() => scoreRepo.init())
  //   .then(() => console.log("db initialized"))
  //   .catch(() => {
  //     console.log("something went wrong during db init");
  //     throw new Error(e);
  //   });
};
