const activityRepo = require('../../repositories/activity');
const mockResponse = require('../dbResponses/activity');

describe('get',()=>{
  it('has a getAll function',()=>{
    expect(activityRepo.getAll).toBeDefined();
  })

})
