const mapManyToOne = require("../utils/remap");
const {
    fetchOneAndCreate,
    fetchOne,
    fetchMany,
} = require("../utils/pgWrapper");
const Camper = require("./camper");
const pool = require("../db");
const DbError = require("../utils/DbError");

class Activity {
    constructor({ name, description, id, sessions,capacity }) {
        this.name = name;
        this.id = id;
        this.description = description || "none";
        this.sessions = sessions || []
        this.capacity = capacity || null
    }
    static _parseResults(dbr) {
        return {
            id: dbr.id,
            name: dbr.name,
            description: dbr.description,
            capacity:dbr.capacity
        };
    }
    static async getAll() {
        const query = `
SELECT
act.name AS name,
act.id,
act.description,
        act.capacity
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
        const client = await pool.connect();
        try {
            // get activity data
            const activityResult = await client.query("SELECT * from activities act WHERE act.id = $1 ", [id]);
            const activity = activityResult.rows.map(r => ({
                id: r.id,
                name: r.name,
                description: r.description,
                capacity:r.capacity
            }))[0];

            const sessionsResult = await client.query("SELECT * from activity_sessions acts WHERE acts.activity_id = $1", [activity.id]);
            const sessions = sessionsResult.rows.map(s => ({
                id: s.id,
                periodId: s.period_id
            }))
            const createdActivity = new Activity({ name: activity.name, id: activity.id, description: activity.description, sessions: sessions })
            await client.query("COMMIT");
            return createdActivity;

        } catch (e) {
            client.query("ROLLBACK");
            console.error("Error with activity transaction")
            return false
        } finally {
            client.release()
        }
    }
    static async create({ name, description }) {
        const query =
            "INSERT INTO activities (name,description) VALUES ($1,$2) RETURNING *";
        const values = [name, description];
        const result = await fetchOne(query, values);
        if (!result) { return false }
        return new Activity({ name: result.name, description: result.description, id: result.id })
    }
    async update({name,description,capacity}){
        const updatedName = name || this.name;
        const updatedDescription = description || this.description;
        const updatedCapacity = capacity || this.capacity;
        const query = `
        UPDATE activities
        SET name = $1, description = $2, capacity = $3
        WHERE id = $4
        RETURNING *
        `
        const values = [updatedName,updatedDescription,updatedCapacity,this.id];
        const result = await pool.query(query,values);
        if(result.rowCount === 0){return false}
        const updatedAct = result.rows[0];
        return new Activity({
            name: updatedAct.name,
            description: updatedAct.description,
            id: updatedAct.id,
            capacity: updatedAct.capacity
        })

    }
    // async addCamper(camperID, periodID) {
    //     const query =
    //         "INSERT INTO camper_activities (camper_week_id,activity_id,period_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT one_activity_per_camper DO UPDATE set activity_id = $2,period_id = $3, is_present = false RETURNING id, period_id,activity_id";
    //     const values = [camperID, this.id, periodID];
    //     const result = await fetchOne(query, values);
    //     const camperActivityID = result.id;
    //     return camperActivityID;
    // }
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
