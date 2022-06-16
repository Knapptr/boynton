const Period = require('../../models/period');
const mockedResponses = require("../dbResponses/period")
const periodRepository = require("../../repositories/period");
jest.mock('../../repositories/period');

describe("get",()=>{
  it("should get all periods",()=>{
    periodRepository.getAll.mockResolvedValue(mockedResponses.repository);
    return Period.getAll().then(res=>{
      expect(res[0]).toBeInstanceOf(Period);
      expect(res[0].number).toBe(1);
      expect(res[0].dayId).toBe(100);
      expect(res[0].activities).toEqual(mockedResponses.repository[0].activities);
    })
  })
  it("returns empty array if no periods",()=>{
    periodRepository.getAll.mockResolvedValue(false);
    return Period.getAll().then(res=>{
      expect(res).toBe(false);
    })
  })
  it("should get one period",()=>{
    periodRepository.get.mockResolvedValue(mockedResponses.repository[0]);
    return Period.get(346).then(res=>{
        expect(res.id).toBe(346);
      expect(res).toBeInstanceOf(Period);
    })
  })
  it("should return false if period does not exist",()=>{
    periodRepository.get.mockResolvedValue(false);
    return Period.get(999).then(res=>{
      expect(res).toBe(false)
    })
  })
})

describe("creation",()=>{
  it("returns a created period",()=>{
    periodRepository.create.mockResolvedValue({number:1,dayId:6,id:99})
    return Period.create({number:1,dayId:6}).then(res=>{
      expect(res).toBeInstanceOf(Period);
      expect(res.id).toBe(99)
    })
  })
  it("throws an error on no creation",()=>{
    periodRepository.create.mockResolvedValue(false)
    return expect(Period.create({number:1})).rejects.toThrow("Cannot create period.")
  })
})

