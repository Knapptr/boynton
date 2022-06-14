const Camper = require("../../models/camper");
const {mappedCampers}  = require('../dbResponses/camper');
const camperRepository = require("../../repositories/camper");
jest.mock("../../repositories/camper");

describe("get",()=>{
  it("gets all campers",()=>{
    expect.assertions(2)
    camperRepository.getAll.mockResolvedValue(mappedCampers)
    return Camper.getAll().then(res=>{
      expect(res.length).toBe(3);
      expect(res[0].firstName).toBe("Tyler");
    })
  })

  it("returns false if no camper",()=>{
    expect.assertions(1)
    const camperId = 0
    camperRepository.getOne.mockResolvedValue(false)
    return Camper.getById(camperId).then(res=>{
      expect(res).toBe(false)
    })
  })
  it("gets  camper by id",()=>{
    expect.assertions(2)
    const camperId = 409
    camperRepository.getOne.mockResolvedValue(mappedCampers.find(c=>c.id === camperId))
    return Camper.getById(camperId).then(res=>{
      expect(res.firstName).toBe("Tyler")
      expect(res.weeks.length).toBe(2)
    })
  })
})

describe("save",()=>{
  it("saves/updates camper", async ()=>{
    const camperId = 409;
    camperRepository.getOne.mockResolvedValue(mappedCampers.find(c=>c.id===camperId))
    const camper = await Camper.getById(camperId);
    await camper.save();
    expect(camperRepository.create).toHaveBeenCalled();
  })
})
