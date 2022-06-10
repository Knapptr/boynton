const weekRepository = require("../../repositories/week");
const {mappedDBWeek,unmappedDBweek} = require("../dbResponses/week")
const { fetchOne, fetchMany } = require("../../utils/pgWrapper");
jest.mock("../../utils/pgWrapper");


describe("get", () => {
  it("returns false if week number doesnt exist", () => {
    fetchOne.mockResolvedValue(false);
    expect(weekRepository.get(0)).resolves.toBe(false);
  });
  it("returns 1 week if exists", () => {
    fetchMany.mockResolvedValue(unmappedDBweek);
    return expect(weekRepository.get(2)).resolves.toEqual(mappedDBWeek);
  });
  it("returns all weeks", () => {
    fetchMany.mockResolvedValue(unmappedDBweek);
    return expect(weekRepository.getAll()).resolves.toEqual([mappedDBWeek]);
  });
});
it("deletes a week and returns deleted week", () => {
  fetchOne.mockResolvedValue({ title: "A new Week", number: 7 });
  expect.assertions(1);
  weekRepository.delete(7).then((res) => {
    return expect(res).toEqual({ title: "A new Week", number: 7 });
  });
});
it("returns false if week does not exist", () => {
  fetchOne.mockResolvedValue(false);
  expect.assertions(1);
  weekRepository.delete(7).then((res) => {
    return expect(res).toBe(false);
  });
});

describe("create", () => {
  it("creates a week", () => {
    const createData = {
      title: "A new Week",
      number: 7,
    };
    const expectedResponse = {
      title: "A new Week",
      number: 7,
      days: [ ],
    };
    expect.assertions(1)
    fetchOne.mockResolvedValue(createData);
    return weekRepository.create(createData).then(res=>{
      expect(res).toEqual(expectedResponse);
    })
  });
  it("sends false when not created", () => {
    const createData = {
      title: "A new Week",
      number: 1,
    };
    expect.assertions(1)
    fetchOne.mockResolvedValue(false);
    return weekRepository.create(createData).then(res=>{
      expect(res).toEqual(false);
    })
  });

});
