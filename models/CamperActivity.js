const pool = require("../db/index");
const { fetchOne } = require("../utils/pgWrapper");
class CamperActivity {
    constructor({ id, weekId, activityId, periodId, isPresent }) {
        (this.id = id), (this.weekId = weekId);
        this.activityId = activityId;
        this.periodId = periodId;
        this.weekId = weekId;
        this.isPresent = isPresent;
    }
    static async get(id) {
        const query = "SELECT * from camper_activities WHERE id = $1";
        const values = [id];
        const result = await fetchOne(query, values);
        if (!result) {
            throw new Error("not found");
        }
        return new CamperActivity({
            id: result.id,
            weekId: result.camper_week_id,
            activityId: result.activity_id,
            periodId: result.period_id,
            isPresent: result.is_present,
        });
    }
    async setPresent(trueOrFalse) {
        const query =
            "UPDATE camper_activities SET is_present = $1 WHERE id = $2 RETURNING *";
        const values = [trueOrFalse, this.id];
        const result = await fetchOne(query, values);
        if (!result) {
            throw new Error("Could not update present value");
        }
        this.isPresent = trueOrFalse;
        return this;
    }

    async update(activitySessionId, isPresent) {
        const query = `
        UPDATE camper_activities
        SET activity_id = $2,
        is_present = $3
        WHERE id = $1
        RETURNING *
        ` ;
        const values = [this.id, activitySessionId, isPresent];

        const result = await fetchOne(query, values);
        if (!result) { throw new Error("Could not update camper activity session") };
        this.activityId = activitySessionId;
        this.isPresent = isPresent;
        return this;


    }
}

module.exports = CamperActivity;
