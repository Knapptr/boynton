const compare = require("../utils/comparePassword");
const pool = require("../db")
const defaultUserRepository = require("../repositories/User");
const { fetchMany, fetchOne } = require("../utils/pgWrapper.js");
const UserRepository = require("../repositories/User");
const encrypt = require("../utils/encryptPassword");
const DbError = require("../utils/DbError");


module.exports = class User {
  constructor(
    { username, password, role, firstName, lastName, lifeguard = false, archery = false, ropes = false, firstYear = false, senior = false, sessions = [] },

    userRepository = defaultUserRepository
  ) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.userRepository = userRepository;
    this.firstName = firstName;
    this.lastName = lastName;
    this.lifeguard = lifeguard;
    this.archery = archery;
    this.firstYear = firstYear;
    this.ropes = ropes;
    this.senior = senior;
    this.sessions = sessions;

  }

  toJSON() {
    return {
      username: this.username,
      role: this.role,
      firstName: this.firstName,
      lastName: this.lastName,
      lifeguard: this.lifeguard,
      archery: this.archery,
      ropes: this.ropes,
      firstYear: this.firstYear,
      senior: this.senior,
      sessions: this.sessions
    }
  }
  static VALID_ROLES = ["admin", "programming", "counselor", "unit_head"]

  static async get(username, userRepository = defaultUserRepository) {
    const userData = await userRepository.get(username);
    if (!userData) {
      return false
    }
    return new User({ ...userData }, userRepository);
  }

  static async getAll() {
    const query = `
    SELECT 
    u.*,
    ss.id as staff_session_id,
    ss.week_number as week_number
    FROM users u
    LEFT JOIN staff_sessions ss ON ss.username = u.username
    ORDER BY last_name, first_name, username, ss.week_number
    `
    const results = await fetchMany(query);
    if (!results) { return [] }

    const usersData = [];

    for (const row of results) {
      const currentUser = (usersData.at(-1) && usersData.at(-1).username === row.username) ? usersData.pop() : {
        username: row.username,
        password: row.password,
        role: row.role,
        firstName: row.first_name,
        lastName: row.last_name,
        senior: row.senior,
        firstYear: row.first_year,
        lifeguard: row.lifeguard,
        archery: row.archery,
        ropes: row.ropes,
        sessions: []
      };

      if (row.staff_session_id !== null) {
        const session = { id: row.staff_session_id, weekNumber: row.week_number }
        currentUser.sessions.push(session);
      }

      usersData.push(currentUser);
    }

    return usersData.map(u => new User(u));
  }

  static async create(
    // Validation is performed by the handler and express-validator
    { username, firstName, lastName, password, role = "counselor", lifeguard = false, archery = false, ropes = false, firstYear = false, senior = false, sessions = [] },
    userRepository = defaultUserRepository
  ) {

    const encryptedPassword = await encrypt(password);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const userQuery = `
      INSERT INTO users 
      (username,
      password,
      role,
      first_name,
      last_name,
      lifeguard,
      archery,
      ropes,
      first_year,
      senior) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * `;

      const userValues = [
        username,
        encryptedPassword,
        role,
        firstName,
        lastName,
        lifeguard,
        archery,
        ropes,
        firstYear,
        senior
      ];


      const userResult = await client.query(userQuery, userValues);
      const userData = userResult.rows[0];

      const sessionQueries = sessions.map(session => {
        console.log("\tMapping Session")
        const sessQuery = "INSERT INTO staff_sessions (username,week_number) VALUES ($1, $2) RETURNING *"
        const sessValues = [userData.username, session.weekNumber];

        return client.query(sessQuery, sessValues);
      })

      const sessionsResult = await Promise.all(sessionQueries);
      const insertedSessions = sessionsResult.map(result => ({ weekNumber: result.rows[0].week_number, id: result.rows[0].id }));

      client.query("COMMIT");
      const user = new User({
        username: userData.username,
        password: userData.password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        senior: userData.senior,
        firstYear: userData.first_year,
        lifeguard: userData.lifeguard,
        archery: userData.archery,
        ropes: userData.ropes,
        sessions: insertedSessions
      })

      return user
    } catch (e) {
      await client.query("ROLLBACK");
      throw DbError.transactionFailure("User creation transaction failed");
    } finally {
      client.release();
    }


  }

  static async authenticate({ username, password }, userRepository = defaultUserRepository) {
    // console.log(`Authenticating: ${username}`)
    const user = await User.get(username, userRepository);
    if (!user) { return false }
    const isAuthenticated = await compare(password, user.password);
    return { user, isAuthenticated };
  }

  static async weekSchedule(username, weekNumber) {
    const query = `
    SELECT 
    d.id as day_id,
    d.name as day_name,
    p.period_number, 
    p.id as period_id,
    act.name as activity_name, 
    acts.id as activity_session_id
    FROM staff_sessions ss
    JOIN days d ON d.week_id = ss.week_number
    JOIN periods p ON p.day_id = d.id
    LEFT JOIN staff_activities sa ON sa.staff_session_id = ss.id AND sa.period_id = p.id
    LEFT JOIN activity_sessions acts ON acts.id = sa.activity_session_id
    LEFT JOIN activities act ON act.id = acts.activity_id
    WHERE d.week_id = $2 AND ss.username = $1
    ORDER BY d.week_id, d.id, p.period_number
    `
    const values = [username, weekNumber]

    const response = await fetchMany(query, values);
    if (!response) { return false }
    // deserialize
    const days = [];

    for (const db of response) {
      const currentDay = (days.at(-1) && days.at(-1).id === db.day_id) ? days.pop() : {
        id: db.day_id,
        name: db.day_name,
        periods: []
      };

      const currentPeriod = (currentDay.periods.at(-1) && currentDay.periods.at(-1).id === db.period_id) ? currentDay.periods.pop() : {
        id: db.period_id,
        number: db.period_number,
        activityName: db.activity_name || "OFF",
        activitySessionId: db.activity_session_id
      }

      currentDay.periods.push(currentPeriod);
      days.push(currentDay);
    }
    return days;
  }

  async delete() {
    const query = "DELETE FROM users WHERE username = $1 RETURNING *";
    const values = [this.username];
    const response = await fetchOne(query, values);
    if (!response) { return false }
    return true
  }

  async update({ sessions, username, firstName, lastName, role, lifeguard, archery, ropes, firstYear, senior }) {
    //TODO There should be some sanitization and validation here of updated values
    const query = `
      UPDATE users
      set username = $1,
      first_name = $2,
      last_name = $3,
      role = $4,
      senior = $5,
      first_year = $6,
      lifeguard = $7,
      archery = $8,
      ropes = $9
      WHERE username = $10
      RETURNING *
    `
    const values = [username, firstName, lastName, role, senior, firstYear, lifeguard, archery, ropes, this.username];

    const response = await fetchOne(query, values);
    if (!response) { return false }
    const userData = {
      username: response.username,
      firstName: response.first_name,
      lastName: response.last_name,
      role: response.role,
      ropes: response.ropes,
      archery: response.archery,
      lifeguard: response.archery,
      firstYear: response.first_year,
      senior: response.senior
    }
    // get the newly created user
    const createdUser = await User.get(response.username);
    // insert sessions for updated user
    const allPromises = [];
    for (const session of sessions) {
      console.log({ processing: session });
      // do nothing if a submitted session already exists on user
      if (createdUser.sessions.some(s => s.weekNumber === session.weekNumber)) {
        continue;
      }
      const sessionQuery = `INSERT INTO staff_sessions (week_number, username) VALUES ($1,$2)`;
      const sessionValues = [session.weekNumber, createdUser.username];
      allPromises.push(fetchOne(sessionQuery, sessionValues));
    }
    for (const session of createdUser.sessions) {
      //check if original users has any sessions that created does not and delete them
      if (!sessions.some(s => s.weekNumber === session.weekNumber)) {
        const delQuery = `DELETE FROM staff_sessions WHERE week_number = $1 AND username = $2`
        const delValues = [session.weekNumber, createdUser.username];
        allPromises.push(fetchOne(delQuery, delValues))
      }
    }

    try {
      const results = await Promise.all(allPromises);
    } catch (e) {
      console.log("ERROR", e);
    }


    // fetch completely updated user
    const user = await User.get(createdUser.username);
    return user;

  }
};
