const mapManyToOne = require("../utils/remap");
const Activity = require("./activity");
const defaultPeriodRepository = require("../repositories/period");
const {
	fetchManyAndCreate,
	fetchMany,
} = require("../utils/pgWrapper");

class Period {
	constructor({number, dayId, id, activities }) {
		this.number = number,
		this.dayId = dayId;
		this.activities = activities || [];
		this.id = id;
	}
	static _parseResults(dbResponse) {
		const period = {
			periodNumber: dbResponse.period_number,
			dayID: dbResponse.day_id,
			id: dbResponse.id,
			activityName: dbResponse.name,
			activityDescription: dbResponse.description,
			activityID: dbResponse.activity_id,
		};
		return period;
	}
	static async create({number, dayId },periodRepository=defaultPeriodRepository) {
    const result = await periodRepository.create({number,dayId});
    if(!result){throw new Error("Cannot create period.")}
    return new Period(result);
	}
	static async getAll(periodRepository = defaultPeriodRepository) {
      const periods = await periodRepository.getAll();
    if(!periods){return false};
      return periods.map(p=>new Period(p))
	}
	static async get(id,periodRepository=defaultPeriodRepository) {
    const period = await periodRepository.get(id);
    if(!period){return false};
    return new Period(period);
	}
	async getActivities() {
		const query = "SELECT * from activities WHERE period_id = $1";
		const values = [this.id];
		const activities = await fetchManyAndCreate({
			query,
			values,
			Model: Activity,
		});
		return activities;
	}
	async addActivity({ name, description }) {
		const activity = await Activity.create({
			name,
			description,
			periodID: this.id,
		});
		return activity;
	}
	async getCampers() {
		const query = `
			SELECT  c.first_name,c.last_name,ca.activity_id,cw.id,cab.name from camper_weeks cw
			JOIN days d ON d.week_id = cw.week_id
			JOIN periods p ON p.day_id = d.id
			JOIN campers c ON cw.camper_id = c.id
			LEFT JOIN camper_activities ca ON ca.period_id = p.id AND ca.camper_week_id = cw.id
			JOIN cabin_sessions cs ON cw.cabin_session_id = cs.id
			JOIN cabins cab ON cab.name = cs.cabin_name

			WHERE p.id = $1

		`;
		const values = [this.id];
		const queryResult = (await fetchMany(query, values)) || [];
		const parsedQuery = queryResult.map((res) => {
			return {
				firstName: res.first_name,
				lastName: res.last_name,
				activityID: res.activity_id || null,
				id: res.id,
				cabinName: res.name,
			};
		});
		return parsedQuery;
	}
}
module.exports = Period;

//test
// (async () => {
// 	// 	const period = await Period.create({ periodNumber: 1, dayID: 1 });
// 	// 	console.log(period);
// 	const period = await Period.get(346);
// 	// console.log(period);
// 	const activities = await period.getActivities();
// 	console.log(activities);
// 	// const activity = await period.addActivity({
// 	// 	name: "Tenniball",
// 	// 	description: "Baseball, but with a tennis ball and racket",
// 	// });
// 	// console.log(activity);
// })();
