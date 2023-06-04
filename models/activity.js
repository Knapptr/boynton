const mapManyToOne = require("../utils/remap");
const {
    fetchOneAndCreate,
    fetchOne,
    fetchMany,
} = require("../utils/pgWrapper");
const Camper = require("./camper");

class Activity {
    constructor({ name, description, id }) {
        this.name = name;
        this.id = id;
        this.description = description || "none";
    }
    static _parseResults(dbr) {
        return {
            id: dbr.id,
            name: dbr.name,
            description: dbr.description
        };
    }
    static async getAll() {
        const query = `
SELECT
act.name AS name,
act.id,
act.description
FROM activities act
ORDER BY act.name
		`;
        const results = await fetchMany(query);
        if (results) {
            const parsedResults = results.map((result) =>
                Activity._parseResults(result)
            );
            const activities = parsedResults.map((act) => new Activity(act));
            return activities;
        }
        return [];
    }
    static async get(id) {
        const query = `
SELECT
act.name AS name,
act.id,
act.period_id,
act.description,
cw.id AS camper_session_id,
cw.camper_id AS camper_id,
c.first_name,
ca.id AS camper_activity_id,
ca.is_present,
c.last_name
FROM activities act
LEFT JOIN camper_activities ca ON ca.activity_id = act.id
LEFT JOIN camper_weeks cw ON cw.id = ca.camper_week_id
LEFT JOIN campers c ON cw.camper_id = c.id
WHERE act.id = $1 `;
        const values = [id];
        const results = await fetchMany(query, values);
        if (results) {
            const parsedResults = results.map((result) =>
                Activity._parseResults(result)
            );
            const mappedResults = mapManyToOne({
                array: parsedResults,
                identifier: "id",
                newField: "campers",
                fieldsToMap: [
                    "sessionID",
                    "camperID",
                    "firstName",
                    "lastName",
                    "isPresent",
                    "camperActivityId",
                ],
                fieldsToRemain: ["name", "id", "periodID", "description"],
            });
            const activities = mappedResults.map((act) => new Activity(act));

            console.log(activities[0].campers);
            return activities[0];
        }
        return [];
    }
    static async create({ name, description }) {
        const query =
            "INSERT INTO activities (name,description) VALUES ($1,$2) RETURNING *";
        const values = [name, description];
        const result = await fetchOne(query, values);
        if (!result) { return false }
        return new Activity({ name: result.name, description: result.description, id: result.id })
    }
    async addCamper(camperID, periodID) {
        const query =
            "INSERT INTO camper_activities (camper_week_id,activity_id,period_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT one_activity_per_camper DO UPDATE set activity_id = $2,period_id = $3, is_present = false RETURNING id, period_id,activity_id";
        const values = [camperID, this.id, periodID];
        const result = await fetchOne(query, values);
        const camperActivityID = result.id;
        return camperActivityID;
    }
}

module.exports = Activity;

//test
(async () => {
    // 	const activity = await Activity.create({
    // 		name: "Yarn Bombing",
    // 		description: "Wrap stuff with yarn!",
    // 		periodID: 2,
    // 	});
    // const activity = await Activity.get(2);
    // console.log(activity);
    // const id = await activity.addCamper(1416);
    // const campers = await activity.getCampers();
    // console.log(campers[0]);
    // const removedCamper = await activity.removeCamper(1416);
    // console.log({ removedCamper });
})();
