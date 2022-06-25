const defaultWeekRepository = require("../repositories/week");

class Week {
	constructor({ title, number,days=[] },weekRepository = defaultWeekRepository) {
    if(!title || !number){ throw new Error("Cannot create Week, title,number required")}
		this.title = title;
		this.days = days;
		this.number = number;
    this._weekRepository = weekRepository
	}
  toJSON(){
    return {
      title: this.title,
      number: this.number,
      days: this.days,
    }
  }
  async delete(){
    const deletedWeek = await this._weekRepository.delete(this.number);
    if(deletedWeek){
      return true
    }
    return false
  }
	static async get(weekNumber,weekRepository=defaultWeekRepository) {
    const week = await weekRepository.get(weekNumber)
    return new Week(week)
    
	}
	static async getAll(weekRepository = defaultWeekRepository) {
    const weeks = await weekRepository.getAll();
    return weeks.map(weekData=> new Week(weekData));
	}
	static async create({ title, number},weekRepository = defaultWeekRepository) {
    const weekResponse = await weekRepository.create({title,number})
		return new Week(weekResponse);
	}
}
module.exports = Week;

