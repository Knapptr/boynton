const Score = require('../../models/score');
const response = require('../dbResponses/score');
const scoreRepo = require('../../repositories/score');
jest.mock('../../repositories/score')

describe('factory bits',()=>{

  it('has a getAll factory',()=>{
    expect(Score.getAll).toBeDefined()
  })

  it('returns Scores from repo response',()=>{
    scoreRepo.getAll.mockResolvedValue(response.repo)
    return Score.getAll().then(res => {
      expect(res[0]).toBeInstanceOf(Score);
    })
  })

  it('returns an empty array if false response',()=>{
    scoreRepo.getAll.mockResolvedValue(false);
    return Score.getAll().then(r=>{
      expect(r).toEqual([])
    })
  })

  it('has a create method',()=>{
    expect(Score.create).toBeDefined();
  })

  it('returns a created score',()=>{
    scoreRepo.create.mockResolvedValue(response.repo[0])
    return Score.create({awardedTo: 'Naumkeags',points:100, awardedFor:"Trash Pickup",weekNumber:1}).then(r=>{
      expect(r).toBeInstanceOf(Score)
    })
  })
  // it('has a get factory',()=>{
  //   expect(Score.get).toBeDefined()
  // })

  // it('returns a single score event by id from repo response',()=>{
  //   return Score.get(1).then(r=>{
  //     expect(r).toBeInstanceOf(Score);
  //   })
  // })
})



