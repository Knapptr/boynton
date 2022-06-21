const defaultRepository = require("../repositories/score");
class Score {
  constructor({ awardedTo, points, awardedFor, weekNumber, id }) {
   this.id = id;
    this.awardedTo = awardedTo;
    this.awardedFor = awardedFor;
    this.weekNumber = weekNumber;
    this.points = points;
  }
  static async getAll(repository = defaultRepository) {
    const response = await repository.getAll();
    if (!response) {
      return [];
    }
    return response.map((r) => new Score(r));
  }
  static async create(props,repository=defaultRepository){
    const response = await repository.create(props);
    return new Score(response);
  }
  // static async get(id, repository=defaultRepository) {
  //   const response = await repository.get(id);
  //   if(!response){return false}
  //   return new Score(response)
  // }
}
module.exports = Score;
