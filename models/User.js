const compare = require("../utils/comparePassword");
const defaultUserRepository = require("../repositories/User");
const { fetchMany, fetchOne } = require("../utils/pgWrapper.js");
const UserRepository = require("../repositories/User");

const VALID_ROLES = ["admin", "unit_head", "programming", "counselor"];

module.exports = class User {
  constructor(
    { username, password, role, firstName, lastName, lifeguard = false, archery = false, ropes = false, firstYear = false, senior = false },

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
      senior: this.senior
    }
  }

  static async get(username, userRepository = defaultUserRepository) {
    const dbUserData = await userRepository.get(username);
    if (!dbUserData) {
      return false
    }
    const userData = {
      username: dbUserData.username,
      password: dbUserData.password,
      role: dbUserData.role,
      lifeguard: dbUserData.lifeguard,
      ropes: dbUserData.ropes,
      archery: dbUserData.archery,
      firstYear: dbUserData.first_year,
      senior: dbUserData.senior,
      firstName: dbUserData.first_name,
      lastName: dbUserData.last_name
    }
    console.log({ userData });
    return new User({ ...userData }, userRepository);
  }

  static async getAll() {
    const query = `
    SELECT 
    username, 
    role,
    first_name,
    last_name,
    senior,
    ropes,
    first_year,
    archery,
    lifeguard
    FROM users
    ORDER BY last_name, first_name, username
    `
    const results = await fetchMany(query);
    if (!results) { return [] }

    return results.map(r => {
      const userData = { username: r.username, password: r.password, role: r.role, firstName: r.first_name, lastName: r.last_name, lifeguard: r.lifeguard, archery: r.archery, ropes: r.ropes, senior: r.senior, firstYear: r.first_year }
      return new User(userData);
    })
  }
  static async create(
    { username, firstName, lastName, password, role = "counselor", lifeguard = false, archery = false, ropes = false, firstYear = false, senior = false },
    userRepository = defaultUserRepository
  ) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Invalid Role: ${role}`);
    }
    if (!username || !password || !firstName || !lastName) {
      throw new Error("Cannot create user, missing fields.");
    }
    const isUser = await userRepository.get(username);
    if (!isUser) {
      const createdData = await userRepository.create({
        username,
        password,
        firstName,
        lastName,
        role,
        lifeguard,
        archery,
        ropes,
        firstYear,
        senior
      });
      return new User(createdData)
    } else {
      throw new Error("Cannot create user, user exists.");
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
    const query = ``
  }

  async delete() {
    const query = "DELETE FROM users WHERE username = $1 RETURNING *";
    const values = [this.username];
    const response = await fetchOne(query, values);
    if (!response) { return false }
    return true
  }

  async update({ username, firstName, lastName, role, lifeguard, archery, ropes, firstYear, senior }) {
    //TODO There should be some sanitization and validation here of updated values
    console.log("Updating user");
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

    console.log("sending request: ", { query, values });
    const response = await fetchOne(query, values);
    if (!response) { return false }
    console.log({ response });
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
    return new User(userData);
  }
};
