const camperRepository = require("../../repositories/camper");
const { fetchOne, fetchMany } = require("../../utils/pgWrapper");
const {
  unmappedCamperResult,
  mappedCampers,
} = require("../dbResponses/camper");
jest.mock("../../utils/pgWrapper");

describe("get", () => {
  it("gets all campers from db", () => {
    fetchMany.mockResolvedValue(unmappedCamperResult);
    return camperRepository.getAll().then((res) => {
      expect(res).toEqual(mappedCampers);
    });
  });
  it("returns false for no camper", () => {
    const camperId = 1;
    fetchMany.mockResolvedValue(false);
    return camperRepository.getOne(camperId).then((res) => {
      expect(res).toBe(false);
    });
  });
  it("gets one camper from db", () => {
    const camperId = 409;
    fetchMany.mockResolvedValue(
      unmappedCamperResult.filter((c) => c.id === camperId)
    );
    return camperRepository.getOne(camperId).then((res) => {
      expect(res.firstName).toBe("Tyler");
      expect(res.lastName).toBe("Knapp");
    });
  });
});

describe("create", () => {
  it("returns false on no insertion", () => {
    expect.assertions(1);
    fetchOne.mockResolvedValue(false);
    return camperRepository
      .create({
        firstName: "Denied",
        lastName: "Request",
        age: 0,
        gender: null,
        id: 0,
      })
      .then((res) => expect(res).toBe(false));
  });
  it("returns camper data after creation", () => {
    expect.assertions(5);
    fetchOne.mockResolvedValue({
      first_name: "Tyler",
      last_name: "Knapp",
      age: 13,
      gender: "Male",
      sessions: undefined,
    });
    return camperRepository
      .create({
        firstName: "Tyler",
        lastName: "Knapp",
        age: 13,
        gender: "Male",
        id: 606,
      })
      .then((res) => {
        expect(res.firstName).toEqual("Tyler");
        expect(res.lastName).toEqual("Knapp");
        expect(res.age).toEqual(13);
        expect(res.gender).toEqual("Male");
        expect(res.weeks.length).toBe(0);
      });
  });
});
