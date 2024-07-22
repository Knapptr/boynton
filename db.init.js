//raw queries should be refactored into the repo model for each table-but I'm in a rush
//they are 'mocked' into repos here for the init funciton
const env = require("dotenv");
env.config();

const queries = require("./initQueries");
const { fetchOne } = require("./utils/pgWrapper");

const init = (query, values) => {
  return async () => {
    try {
      await fetchOne(query, values);
      return true;
    } catch (e) {
      console.log({ query });
      console.log(e.stack)
      process.exit(1);
    }
  };
};
const activityRepo = { init: init(queries.activities) };
const activitySessionsRepo = { init: init(queries.activitySessions) };
const cabinSessionRepo = { init: init(queries.cabinSessions) };
const cabinRepo = { init: init(queries.cabins) };
const camperActivityRepo = { init: init(queries.camperActivities) };
const camperWeekRepo = { init: init(queries.camperWeeks) };
const userRepo = { init: init(queries.users) };
const staffSession = { init: init(queries.staffSession) };
const thumbsUp = {init: init(queries.thumbsUp)};
// const staffActivities = { init: init(queries.staffActivities) };
const camperRepo = require("./repositories/camper");
const dayRepo = require("./repositories/day");
const periodRepo = require("./repositories/period");
const scoreRepo = require("./repositories/score");
const weekRepo = require("./repositories/week");
const pool = require("./db");
const encrypt = require("./utils/encryptPassword");
const programAreaRepo = { init: init(queries.programAreas) };
const awardRepo = { init: init(queries.awards) };
const camperComments = {init:init(queries.camperComment)};
const freetimes = {init:init(queries.freetimes)};
const staffOns = {init:init(queries.staffOnPeriods)};
const activityLocations = {init:init(queries.activityLocations)};

//order matters here
const repos = [
  userRepo,
  weekRepo,
  dayRepo,
  periodRepo,
  freetimes,
  activityRepo,
  activitySessionsRepo,
  cabinRepo,
  cabinSessionRepo,
  staffSession,
  thumbsUp,
  // staffActivities,
  staffOns,
  camperRepo,
  camperWeekRepo,
  camperActivityRepo,
  scoreRepo,
  programAreaRepo,
  awardRepo,
  camperComments,
  activityLocations
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
  // if there are no users, add default admin
  const users = await pool.query("SELECT * from users");
  if (users.rows.length === 0) {
    const userQuery = "INSERT INTO users (username,password,role,first_name,last_name) VALUES ($1,$2,$3,$4,$5)";
    // hash password
    const hashedPw = await encrypt(process.env.DEFAULT_ADMIN_PASSWORD);
    const values = [process.env.DEFAULT_ADMIN_USERNAME, hashedPw, "admin", process.env.DEFAULT_ADMIN_FIRSTNAME, process.env.DEFAULT_ADMIN_LASTNAME];
    await pool.query(userQuery, values);
  }
  console.log("DB Initialized");
};
