const Week = require("../../models/week");
const {mappedDBWeek} = require("../dbResponses/week");
const weekRepository = require("../../repositories/week");
jest.mock("../../repositories/week");

describe("creation",()=>{
  it("fails on missing fields",()=>{
    expect(()=>{new Week({number:2})}).toThrow()
  })
  it("runs without days",()=>{
    const week =new Week({number:2,title:"Time Travel Week"})
  expect(week.days.length).toBe(0)
  })
  it("creates a new week",()=>{
    weekRepository.create.mockResolvedValue({title:"A new Week",number:7,days:[]})
    expect.assertions(3);
    return Week.create({title:"A new Week",number:7}).then(createdWeek=>{
      expect(createdWeek.title).toBe("A new Week")
      expect(createdWeek.number).toBe(7)
      expect(createdWeek.days).toEqual([])
    });
  })
})

describe("Get",()=>{
  it("gets all weeks",()=>{
    weekRepository.getAll.mockResolvedValue([mappedDBWeek])
    return Week.getAll().then(res=>{
      expect(res.length).toBe(1)
      expect(res[0].title).toBe("Around the world week")
      expect(res[0].days.length).toBe(2)
    })
  })
  it("gets one week",()=>{
    weekRepository.get.mockResolvedValue(mappedDBWeek);
    return Week.get(2).then(res=>{
      expect(res.title).toBe("Around the world week")
      expect(res.days.length).toBe(2);
    })
  })
})
