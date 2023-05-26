const compare = require("../utils/comparePassword");
const defaultUserRepository = require("../repositories/User");

module.exports = class User {
  constructor(
    { username, password, role },
    userRepository = defaultUserRepository
  ) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.userRepository = userRepository;
  }

  static async get(username, userRepository = defaultUserRepository) {
    const userData = await userRepository.get(username);
    if (!userData) {
      return false
    }
    return new User({ ...userData }, userRepository);
  }

  static async create(
    { username, password, role = "default" },
    userRepository = defaultUserRepository
  ) {
    if (!username || !password) {
      throw new Error("Cannot create user, missing fields.");
    }
    const isUser = await userRepository.get(username);
    if (!isUser) {
      const createdData = await userRepository.create({
        username,
        password,
        role,
      });
      return new User(createdData);
    } else {
      throw new Error("Cannot create user, user exists.");
    }
  }

  static async authenticate({ username, password }, userRepository = defaultUserRepository) {
    console.log(`Authenticating: ${username}`)
    const user = await User.get(username, userRepository);
    if (!user) { return false }
    const isAuthenticated = await compare(password, user.password);
    return { user, isAuthenticated };
  }
};
