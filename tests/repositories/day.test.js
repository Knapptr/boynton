const dayRepository = require('../../repositories/day');
const notImplemented = require('../notImplemented')
const responseMocks = require('../dbResponses/day');
const {fetchOne,fetchMany} = require("../../utils/pgWrapper");
jest.mock('../../utils/pgWrapper')

describe("Get",()=>{
  it("Gets all days",()=>{
      fetchMany.mockResolvedValue(responseMocks.dbResponse) 
   return  dayRepository.getAll().then(res=>{
      expect(res).toEqual(responseMocks.repoReponse)
    })
  })
  it("Returns empty array if no days",()=>{
    fetchMany.mockResolvedValue(false);
    return dayRepository.getAll().then(res=>{
      expect(res).toEqual([])
    })
  })
  it("Gets one day",()=>{
    fetchOne.mockResolvedValue(responseMocks.dbResponse[0]);
    return dayRepository.getOne(100).then(res=>{
      expect(res).toEqual(responseMocks.repoReponse[0])
    })
  })
  it("Returns false if single day doesnt exist",()=>{
    fetchOne.mockResolvedValue(false);
    return dayRepository.getOne(999).then(res=>{
      expect(res).toBe(false);
    })
  })
})

describe("Create",()=>{
  it("has an init function",()=>{
    expect(dayRepository.init).toBeDefined();
  })
  it("Returns a created day",()=>{
    fetchOne.mockResolvedValue(responseMocks.dbResponse[0])
    return dayRepository.create({name:"MON",weekId:1}).then(res=>{
      expect(res).toEqual(responseMocks.repoReponse[0])
    })
  })
  it("Returns false if day not created",()=>{
    fetchOne.mockResolvedValue(false) ;
    return dayRepository.create({name:"MON"}).then(res=>{
      expect(res).toEqual(false)
    })
  })

})
