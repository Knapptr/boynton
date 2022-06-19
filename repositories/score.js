const {fetchMany,fetchOne} = require('../utils/pgWrapper')
module.exports = {
  _mapResponse(dbResponse){
    return {
        id:dbResponse.id,
      awardedAt:dbResponse.awarded_at,
      awardedTo:dbResponse.awarded_to,
      points:dbResponse.points,
      awardedFor:dbResponse.awarded_for,
      weekNumber:dbResponse.week_number
    }
  },
  async getAll(){
    const query = `
      SELECT * FROM scores
    `
    const dbResponse = await fetchMany(query);
    if(!dbResponse){return false}
    return dbResponse.map(this._mapResponse)
  },
  async create({awardedTo,points,awardedFor,weekNumber}){
    const query = 
    'INSERT INTO scores (awarded_to,points,awarded_for,week_number,awarded_at) VALUES ($1, $2, $3, $4,$5) '
    const awardedAt = Date.now();
    const values = [awardedTo,points,awardedFor,weekNumber,awardedAt];
    const result = await fetchOne(query,values);
    return this._mapResponse(result)

  }
}
