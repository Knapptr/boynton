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
      console.log(e);
      return false;
    }
  };
};
const activityRepo = { init: init(queries.activityRepo) };
const cabinSessionRepo = { init: init(queries.cabinSessions) };
const cabinRepo = {init: init(queries.cabins)};
const camperActivityRepo = {init: init(queries.camperActivities)}
const camperWeekRepo = {init: init(queries.camperWeeks)}
const userRepo = require("./repositories/User");
const camperRepo = require("./repositories/camper");
const dayRepo = require("./repositories/day");
const periodRepo = require("./repositories/period");
const scoreRepo = require("./repositories/score");
const weekRepo = require("./repositories/week");

//order matters here
const repos = [weekRepo, dayRepo, periodRepo, camperRepo, userRepo, scoreRepo];
