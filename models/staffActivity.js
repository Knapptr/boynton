const pool = require("../db");
const { fetchMany, fetchOne } = require("../utils/pgWrapper");
const StaffActivity = {
    async delete(id) {
        console.log("Delete staffer: ", id)
        const query = `UPDATE staff_on_periods SET activity_session_id = null WHERE id = $1 RETURNING *`;
        const values = [id];
        console.log({values});
        
        const result = await pool.query(query,values);
        console.log({rows:result.rows});
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
