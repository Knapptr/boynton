const Week = require("../../models/week");
const weekRepository = require("../../repositories/week");
jest.mock("../../repositories/week");

describe("creation",()=>{
  it("creates a week without days field",()=>{
    weekRepository.create.mockResolvedValue({title:"A new Week",number:7,days:[]})
    expect.assertions(3);
    return Week.create({title:"A new Week",number:7}).then(createdWeek=>{
      expect(createdWeek.title).toBe("A new Week")
      expect(createdWeek.number).toBe(7)
      expect(createdWeek.days).toEqual([])
    })
  })
})
