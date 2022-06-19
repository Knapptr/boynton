const scoreRepo = require('../../repositories/score')
const {fetchMany, fetchOne} = require('../../utils/pgWrapper');
jest.mock('../../utils/pgWrapper')
const response = require('../dbResponses/score');

describe('unorganized tests',()=>{
  it('has an init function',()=>{
    expect(scoreRepo.init).toBeDefined();
  })
  it('has a get all function',()=>{
    expect(scoreRepo.getAll).not.toBeUndefined()
  })
  it('returns all score events',()=>{
    fetchMany.mockResolvedValue(response.db);
    scoreRepo.getAll().then(r=>{
      expect(r).toEqual(response.repo)
    })})
  it('returns false if no  results',()=>{
    fetchMany.mockResolvedValue(false);
    scoreRepo.getAll().then(r=>{
      expect(r).toEqual(false)
    })
  })
  it('has a create function',()=>{
    expect(scoreRepo.create).not.toBeUndefined();
  }) 
  it('returns an inserted score event',()=>{
    fetchOne.mockResolvedValue(response.db[0])
    return scoreRepo.create({
      awardedTo: 'Naumkeags',
      points: 100,
      awardedFor: 'Trash Pickup',
      weekNumber: 1
    }).then(res =>{
      expect(res).toEqual(response.repo[0])
    })
  })
  
})
