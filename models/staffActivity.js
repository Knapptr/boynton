const { fetchMany, fetchOne } = require("../utils/pgWrapper");
const StaffActivity = {
    async delete(id) {
        const query = `
        DELETE FROM staff_activities sa
        WHERE sa.id = $1
        RETURNING *
        `
        const values = [id];

        const result = await fetchOne(query, values);
        if (!result) { return false }
        return {
            id: result.id,
            staffSessionId: result.staff_session_id,
            periodId: result.period_id,
            activitySessionId: result.activity_session_id
        }

    }
}

module.exports = StaffActivity;
