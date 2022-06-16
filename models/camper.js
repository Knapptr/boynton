const defaultCamperRepository = require('../repositories/camper');

class Camper {
	constructor({ firstName, lastName, gender, id, age, weeks = undefined },camperRepository = defaultCamperRepository) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.weeks = weeks;
		this.gender = gender;
		this.id = id;
		this.age = age;
    this.camperRepository = camperRepository
	}
  toJSON(){
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      gender: this.gender,
      weeks: this.weeks,

    }
  }
  async save(){
    const response = await this.camperRepository.create({
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      gender: this.gender,
      id: this.id,
    })
    return response;
  }
	static async getAll(camperRepository = defaultCamperRepository) {
    const response = await camperRepository.getAll();
    return response.map(c=>new Camper(c))
		// const query = `
	}
	static async getById(id,camperRepository = defaultCamperRepository) {
      const response = await camperRepository.getOne(id)
    if(!response){return false}
      return new Camper(response);
}}

module.exports = Camper;
