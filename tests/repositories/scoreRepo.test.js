const scoreRepo = require('../../repositories/score')
const {fetchMany, fetchOne} = require('../../utils/pgWrapper');
jest.mock('../../utils/pgWrapper')

const dbResponse = [
  {awarded_at: '7/7/22',
    awarded_to: 'Naumkeags',
    points: 100,
    awarded_for: "Trash Pickup",
    week_number: 1,
    id: 1
  },
  {awarded_at: '7/7/22',
    awarded_to: 'Tahattawans',
    points: 99,
    awarded_for: "Trash Pickup",
    week_number: 1,
    id:2
  }
]
const repoResponse = [
{awardedAt: '7/7/22',
    awardedTo: 'Naumkeags',
    points: 100,
    awardedFor:"Trash Pickup",
    weekNumber: 1,
  id:1
  },
  {awardedAt: '7/7/22',
    awardedTo: 'Tahattawans',
    points: 99,
    awardedFor: "Trash Pickup",
    weekNumber: 1,
    id:2
  }
  ]
describe('get',()=>{
  it('has a get all function',()=>{
    expect(scoreRepo.getAll).not.toBeUndefined()
  })
  it('returns all score events',()=>{
    fetchMany.mockResolvedValue(dbResponse);
    scoreRepo.getAll().then(r=>{
      expect(r).toEqual(repoResponse)
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
    fetchOne.mockResolvedValue(dbResponse[0])
    return scoreRepo.create({
      awardedTo: 'Naumkeags',
      points: 100,
      awardedFor: 'Trash Pickup',
      weekNumber: 1
    }).then(res =>{
      expect(res).toEqual(repoResponse[0])
    })
  })
})
