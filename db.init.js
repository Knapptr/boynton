//raw queries should be refactored into the repo model for each table-but I'm in a rush
//they are 'mocked' into repos here for the init funciton
const env = require("dotenv");
env.config();

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
const activitySessionsRepo = { init: init(queries.activitySessions) };
const cabinSessionRepo = { init: init(queries.cabinSessions) };
const cabinRepo = { init: init(queries.cabins) };
const camperActivityRepo = { init: init(queries.camperActivities) };
const camperWeekRepo = { init: init(queries.camperWeeks) };
const userActivityRepo = { init: init(queries.userActivities) };
const userRepo = require("./repositories/User");
const camperRepo = require("./repositories/camper");
const dayRepo = require("./repositories/day");
const periodRepo = require("./repositories/period");
const scoreRepo = require("./repositories/score");
const weekRepo = require("./repositories/week");

//order matters here
const repos = [
  userRepo,
  weekRepo,
  dayRepo,
  periodRepo,
  activityRepo,
  activitySessionsRepo,
  userActivityRepo,
  cabinRepo,
  cabinSessionRepo,
  camperRepo,
  camperWeekRepo,
  camperActivityRepo,
  scoreRepo,
];

module.exports = async () => {
  // this does not guarantee the order of execution
  // try {
  //   await Promise.all(repos.map((r) => r.init()));
  //   console.log('db initialized');
  // } catch (e) {
  //   throw new Error(`Error with db init: ${e}`);
  // }

  for (let repo of repos) {
    try {
      await repo.init()
    }
    catch (e) {
      console.log("something went wrong during db init");
      console.log("repo:", repo)
      throw new Error(e);
    }
  }
  console.log("DB Initialized");
};
