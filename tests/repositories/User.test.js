const UserRepository = require("../../repositories/User");
const { fetchOne, fetchMany } = require("../../utils/pgWrapper");
jest.mock("../../utils/pgWrapper");

afterEach(() => {
  jest.resetAllMocks();
});
describe("get a user", () => {
  it("returns false if no results", () => {
    fetchOne.mockResolvedValue(false);
    UserRepository.get("userNull").then((res) => expect(res).toBe(false));
  });
  const dbUser = { username: "user1", role: "admin" };
  it("returns a user object when it exists", () => {
    fetchOne.mockResolvedValue(dbUser);
    UserRepository.get("user1").then((res) => expect(res).toEqual(dbUser));
  });
});

describe("create a user", () => {
  it("returns false if not created", () => {
    fetchOne.mockImplementation(() => {
      throw new Error("Cannot create user");
    });

    return UserRepository.create({ username: "createMe" }).then((res) =>
      expect(res).toBe(false)
    );
  });
  it("returns created user ", () => {
    const dbUser = { username: "user2", role: "unitHead" };
    fetchOne.mockResolvedValue(dbUser);
    return UserRepository.create({
      username: "user2",
      password: "password",
      role: "unitHead",
    }).then((res) => expect(res).toEqual(dbUser));
  });
});

describe("delete a user", () => {
  it("returns false if not deleted/user doesn't exist", () => {
    fetchOne.mockResolvedValue(false);
    return UserRepository.delete("userNull").then((res) =>
      expect(res).toBe(false)
    );
  });
  it("returns username and role of deleted user", () => {
    const dbUser = { username: "user2", role: "unitHead" };
    fetchOne.mockResolvedValue(dbUser);
    return UserRepository.delete("user2").then((res) =>
      expect(res).toEqual(dbUser)
    );
  });
});
