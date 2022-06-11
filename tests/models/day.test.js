const Day = require('../../models/day');
const mockResponse = require('../dbResponses/day')
const dayRepository = require('../../repositories/day');
jest.mock("../../repositories/day");

describe("get",()=>{
  it("getsAll",()=>{
    dayRepository.getAll.mockResolvedValue(mockResponse.repoReponse)
    return Day.getAll().then(res=>{
      expect(res.length).toBe(10)
      expect(res[0]).toBeInstanceOf(Day)
    })
  })
  it("getsOne",()=>{
    dayRepository.getOne.mockResolvedValue(mockResponse.repoReponse[0])
    return Day.get(100) .then(res=>{
      expect(res.name).toBe("MON")
      expect(res).toBeInstanceOf(Day)
    })
  })
  it("error on not found",()=>{
    dayRepository.getOne.mockResolvedValue(false);
    expect(Day.get(999)).rejects.toThrow("Could not find day with id: 999")
  })
})

describe("create",()=>{
  it("creates a Day ",()=>{
    dayRepository.create.mockResolvedValue(mockResponse.repoReponse[0])
    return Day.create({name:"MON",weekNumber:1}).then(res=>{
      expect(res).toBeInstanceOf(Day)
    })
  })
  it("Throw an error on no creation",()=>{
    dayRepository.create.mockResolvedValue(false);
    expect(Day.create({name:"MON"})).rejects.toThrow("Could not create week.")
  })
})
