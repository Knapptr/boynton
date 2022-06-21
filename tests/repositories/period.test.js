const periodRepository = require("../../repositories/period")
const mockResponse = require("../dbResponses/period")
const {fetchOne,fetchMany} = require("../../utils/pgWrapper");
jest.mock("../../utils/pgWrapper");


describe("get",()=>{
  it("gets all periods",()=>{
    fetchMany.mockResolvedValue(mockResponse.db);
    return periodRepository.getAll().then(res=>{
      expect(res).toEqual(mockResponse.repository)
    })
  })
  it("return empty array if no results",()=>{
    fetchMany.mockResolvedValue(false);
    return periodRepository.getAll().then(res=>{
      expect(res).toEqual([])
    })
  })
  it("gets one period",()=>{
    const periodId = 346
    fetchMany.mockResolvedValue(mockResponse.db.filter(p=>p.id === periodId));
    return periodRepository.get(periodId).then(res=>{
      expect(res).toEqual(mockResponse.repository.filter(p=>p.id === periodId)[0])
    })
  })
  it("returns false if no period found",()=>{
    fetchMany.mockResolvedValue(false);
    return periodRepository.get(999).then(res=>{
      expect(res).toBe(false)
    })
  })
})
describe("creation",()=>{
  it('has an init method',()=>{
    expect(periodRepository.init).toBeDefined();
  })
  it("inserts a period",()=>{
    fetchOne.mockResolvedValue({day_id:106,period_number:1,id:777})
    return periodRepository.create({dayId:106,number:1}).then(res=>{
      expect(res).toEqual({dayId:106,number:1,id:777})
    })
  })
  it("returns false on no insertion",()=>{
    fetchOne.mockResolvedValue(false)
    return periodRepository.create({number:1}).then(res=>{
      expect(res).toBe(false);
    })
  })
})
