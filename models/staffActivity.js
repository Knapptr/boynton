const { fetchMany, fetchOne } = require("../utils/pgWrapper");
const StaffActivity = {
    async delete(id) {
        const query = `
        WITH target_staff_activity AS (
SELECT acts.activity_id as activity_id, sa.activity_session_id as activity_session_id, sa.id as staff_activity_id,sa.staff_session_id,  all_week,sa.period_id,p.period_number,w.number as week_number 
    from staff_activities sa 
    JOIN periods p on p.id = sa.period_id
    JOIN activity_sessions acts ON acts.id = sa.activity_session_id
    JOIN days d on d.id = p.day_id
    JOIN weeks w on w.number = d.week_id
    WHERE sa.id = $1 )
    DELETE FROM staff_activities sa WHERE sa.id IN 
(SELECT sa.id from 
target_staff_activity tsa
JOIN staff_activities sa ON tsa.all_week = true AND sa.staff_session_id = tsa.staff_session_id
JOIN activity_sessions acts ON sa.activity_session_id = acts.id
JOIN periods p ON sa.period_id = p.id AND p.period_number = tsa.period_number
JOIN days d ON d.id = p.day_id
JOIN weeks w ON w.number = d.week_id AND w.number = tsa.week_number)`
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
