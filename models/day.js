const { fetchManyAndCreate, fetchOneAndCreate } = require("../utils/pgWrapper");
const defaultDayRepository = require('../repositories/day');
class Day {
  constructor({ name, weekNumber, id }) {
    this.name = name;
    this.weekNumber = weekNumber;
    this.id = id;
  }

  static async create({ name, weekNumber },dayRepository=defaultDayRepository) {
    const result = await dayRepository.create({name,weekNumber});
    if(!result){ throw new Error("Could not create week.")}
    return new Day(result);
  }
  static async get(id,dayRepository=defaultDayRepository) {
    const response = await dayRepository.getOne(id);
    if(!response){throw new Error(`Could not find day with id: ${id}`)}
    return new Day(response)
  }
  static async getAll(dayRepository=defaultDayRepository) {
    const response = await dayRepository.getAll();
    return response.map(d=>new Day(d))
  }
}
module.exports = Day;
