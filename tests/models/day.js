const Day = require('../../models/day');
const mockResponse = require('../dbResponses/day')
const dayRepository = require('../../repositories/day');
jest.mock("../../repositories/day");

describe("get",()=>{
  it("getsAll",()=>{
    dayRepository.getAll.mockResolvedValue(mockResponse.repoReponse)
    return Day.getAll().then(res=>{
      expect(res.length).toBe(10)
    })
  })
  // it("getsOne",()=>{

  // })
  // it("error on not found",()=>{

  // })
})
