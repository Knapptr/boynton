const User = require("../../models/User");
const userRepository = require("../../repositories/User");
const compare = require("../../utils/comparePassword")
jest.mock("../../repositories/User");
jest.mock("../../utils/comparePassword");

describe("Fetch Users", () => {
  it("returns false if no user", () => {
    userRepository.get.mockResolvedValue(false);
    return expect(User.get("user1", userRepository)).resolves.toBe(
false
    );
  });
  it("returns user if it exists", () => {
    const dbUser = { username: "user1", role: "admin", password: "xxxxxx" };
    userRepository.get.mockResolvedValue(dbUser);
    // expect.assertions(3)
    return User.get("user1", userRepository).then((res) => {
      expect(res.username).toEqual(dbUser.username);
      expect(res.role).toEqual(dbUser.role);
      expect(res.userRepository).toEqual(userRepository);
    });
  });
});

describe("create users", () => {
  it("throws an error on creating user that exists", () => {
    const dbUser = { username: "user1", role: "admin", password: "xxx" };
    userRepository.get.mockResolvedValue(dbUser);
    return expect(
      User.create(
        { username: "user1", password: "xax", role: "admin" },
        userRepository
      )
    ).rejects.toThrow("Cannot create user, user exists.");
  });
  it("throws if missing password", () => {
    return expect(
      User.create({ username: "user1", role: "admin" }, userRepository)
    ).rejects.toThrow("Cannot create user, missing fields.");
  });
  it("throws if missing username", () => {
    return expect(
      User.create({ password: "xxx", role: "admin" }, userRepository)
    ).rejects.toThrow("Cannot create user, missing fields.");
  });
  it("returns a created user", () => {
    const dbUser = { username: "user1", role: "admin", password: "xxx" };
    userRepository.get.mockResolvedValue(false);
    userRepository.create.mockResolvedValue(dbUser);
    expect.assertions(3);
    return User.create(dbUser, userRepository).then((res) => {
      expect(res.username).toEqual("user1");
      expect(res.role).toEqual("admin");
      expect(res.password).not.toBe(false);
    });
  });
});

describe("authenticate users", () => {
  it("returns false if user does not exist", () => {
    userRepository.get.mockResolvedValue(false);
    expect(
      User.authenticate(
        { username: "userNull", password: "xox" },
        userRepository
      )
    ).resolves.toBe(false);
  });
  it("returns new user on creation",()=>{
    userRepository.get.mockResolvedValue({username:"user1",password:"xox"});
    compare.mockImplementation((password,password2)=>password===password2)
    expect.assertions(3);
    return User.authenticate({username:"user1",password:"xox"},userRepository).then(res=>{
      expect(res.user.username).toEqual("user1");
      expect(res.isAuthenticated).toBe(true)
      expect(res.user.userRepository).toEqual(userRepository)
    })
    
  })
});
