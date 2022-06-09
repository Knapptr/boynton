const weekRepository = require("../../repositories/week");

const { fetchOne, fetchMany } = require("../../utils/pgWrapper");
jest.mock("../../utils/pgWrapper");

const newWeekData = {
  title: "A new Weeks",
  number: 7,
  days: [],
};

const unmappedDBweek = [
  {
    title: "Around the world week",
    number: 2,
    day_id: 2,
    day_name: "Monday",
    period_id: 6,
    period_number: 1,
  },
  {
    title: "Around the world week",
    number: 2,
    day_id: 2,
    day_name: "Monday",
    period_id: 7,
    period_number: 2,
  },
  {
    title: "Around the world week",
    number: 2,
    day_id: 3,
    day_name: "Tuesday",
    period_id: 8,
    period_number: 1,
  },
  {
    title: "Around the world week",
    number: 2,
    day_id: 3,
    day_name: "Tuesday",
    period_id: 9,
    period_number: 2,
  },
];
const mappedDBWeek = {
  title: "Around the world week",
  number: 2,
  days: [
    {
      id: 2,
      name: "Monday",
      periods: [
        { number: 1, id: 6 },
        { number: 2, id: 7 },
      ],
    },
    {
      id: 3,
      name: "Tuesday",
      periods: [
        { number: 1, id: 8 },
        { number: 2, id: 9 },
      ],
    },
  ],
};
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
//for the love of god work on this when your brain works
describe("create", () => {
  //This test AND code need to be refactored Yikes.
  //TODO this is FRAGILE and WILL BREAK
  it("creates a week", () => {
    const createData = {
      title: "A new Week",
      number: 7,
      days: [
        { name: "MON", numberOfPeriods: 2 },
        { name: "TUE", numberOfPeriods: 1 },
      ],
    };
    const expectedResponse = {
      title: "A new Week",
      number: 7,
      days: [
        {
          id: 1,
          name: "MON",
          periods: [
            { id: 1, number: 1 },
            { id: 2, number: 2 },
          ],
        },
        { id: 2, name: "TUE", periods: [{ id: 3, number: 1 }] },
      ],
    };

    //create weeks
    //create days
    //TODO this is FRAGILE and WILL BREAK
    fetchOne.mockResolvedValueOnce({ title: "A new Week", number: 7 });
    //create days
    //TODO this is FRAGILE and WILL BREAK
    fetchOne.mockResolvedValueOnce({ name: "MON", id: 1 });
    fetchOne.mockResolvedValueOnce({ name: "TUE", id: 2 });
    fetchOne.mockImplementation((query, values) =>
      Promise.resolve({
        number: values[1],
        id: Math.floor(Math.random() * 100),
        day_id: values[0],
      })
    );
    expect.assertions(4);
    return weekRepository.create(createData).then((res) => {
      expect(res.title).toEqual("A new Week");
      expect(res.number).toEqual(7);
      expect(res.days.length).toEqual(2);
      expect(res.days[0].periods.length).toEqual(2);
    });
  });
 //This test AND code need to be refactored Yikes.
  //TODO this is FRAGILE and WILL BREAK
  it("creates a week without days", () => {
    const createData = {
      title: "A new Week",
      number: 7,
    
    };
    const expectedResponse = {
      title: "A new Week",
      number: 7,
      days: [ ],
    };

    //create weeks
    //create days
    //TODO this is FRAGILE and WILL BREAK
    fetchOne.mockResolvedValueOnce({ title: "A new Week", number: 7 });
    //create days
    //TODO this is FRAGILE and WILL BREAK
    // fetchOne.mockResolvedValueOnce({ name: "MON", id: 1 });
    // fetchOne.mockResolvedValueOnce({ name: "TUE", id: 2 });
    // fetchOne.mockImplementation((query, values) =>
    //   Promise.resolve({
    //     number: values[1],
    //     id: Math.floor(Math.random() * 100),
    //     day_id: values[0],
    //   })
    // );
    expect.assertions(3);
    return weekRepository.create(createData).then((res) => {
      expect(res.title).toEqual("A new Week");
      expect(res.number).toEqual(7);
      expect(res.days.length).toEqual(0);
    });
  });

});
