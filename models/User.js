const compare = require("../utils/comparePassword");
const defaultUserRepository = require("../repositories/User");
const { fetchMany, fetchOne } = require("../utils/pgWrapper.js");
const UserRepository = require("../repositories/User");

const VALID_ROLES = ["admin", "unit_head", "programming", "counselor"];

module.exports = class User {
  constructor(
    { username, password, role, firstName, lastName },
    userRepository = defaultUserRepository
  ) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.userRepository = userRepository;
    this.firstName = firstName;
    this.lastName = lastName
  }

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
    username, 
    role,
    first_name,
    last_name
    FROM users
    `
    const results = await fetchMany(query);
    if (!results) { return [] }
    return results.map(r => new User({ username: r.username, password: r.password, role: r.role, firstName: r.first_name, lastName: r.last_name }), UserRepository);
  }
  static async create(
    { username, firstName, lastName, password, role = "counselor" },
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
      });
      return new User({ username: createdData.username, password: createdData.password, firstName: createdData.first_name, lastName: createdData.last_name, role: createdData.role });
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

  async delete() {
    const query = "DELETE FROM users WHERE username = $1 RETURNING *";
    const values = [this.username];
    const response = await fetchOne(query, values);
    if (!response) { return false }
    return true
  }

  async update({ username, firstName, lastName, role }) {
    //TODO There should be some sanitization and validation here of updated values
    const query = `
      UPDATE users
      set username = $1,
      first_name = $2,
      last_name = $3,
      role = $4
      WHERE username = $5
      RETURNING *
    `
    const values = [username, firstName, lastName, role, this.username];

    const response = await fetchOne(query, values);
    if (!response) { return false }
    return new User(response)
  }
};
