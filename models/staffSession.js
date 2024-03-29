const pool = require("../db");
const { fetchMany, fetchOne } = require("../utils/pgWrapper");
const MAX_DAILY_ASSIGNMENTS = process.env.MAX_DAILY_ASSIGNMENTS || 2;
const StaffSession = {
    async get(id) {
        const query = `SELECT 
        ss.id as staff_session_id,
        cab.name as cabin_assignment_name,
        cs.id as cabin_session_id,
        u.username,
        u.last_name,
        u.first_name,
        u.archery,
        u.ropes,
        u.senior,
        u.first_year
        FROM staff_sessions ss
        JOIN users u ON u.username = ss.username
        LEFT JOIN cabin_sessions cs ON ss.cabin_assignment = cs.id
        LEFT JOIN cabins cab ON cab.name = cs.cabin_name
        WHERE ss.id = $1
        `
        const values = [id];

        const response = await fetchOne(query, values);
        if (!response) { return false }
        return {
            username: response.username,
            lastName: response.last_name,
            firstName: response.first_name,
            archery: response.archery,
            ropes: response.ropes,
            senior: response.senior,
            firstYear: response.first_year,
            cabinAssignment: response.cabin_assignment,
            staffSessionId: response.staff_session_id
        }
    },
    async getSome(idList) {
        const query = `SELECT 
        ss.id as staff_session_id,
        cs.id as cabin_session_id,
        cab.name as cabin_assignment_name,
        u.username,
        u.last_name,
        u.first_name,
        u.archery,
        u.ropes,
        u.senior,
        u.first_year
        FROM staff_sessions ss
        JOIN users u ON u.username = ss.username
        LEFT JOIN cabin_sessions cs ON cs.id = ss.cabin_assignment
        LEFT JOIN cabins cab ON cab.name = cs.cabin_name
        WHERE ss.id = ANY ($1)`
        const values = [idList];
        console.log({ query, values });
        const response = await pool.query(query, values);
        console.log("GET SOME");
        console.log({ r: response.rows });
        return response.rows.map(r => ({
            staffSessionId: r.staff_session_id,
            username: r.username,
            lastName: r.last_name,
            firstName: r.first_name,
            archery: r.archery,
            ropes: r.ropes,
            senior: r.senior,
            firstYear: r.first_year,
        }))
    },
    async getAvailablePeriod(periodId) {
        const query = `
            SELECT 
            ss.id AS staff_session_id,
            u.username,
            cab.name as cabin_assignment_name,
            cs.id as cabin_session_id,
            u.first_name,
            u.last_name,
            u.lifeguard,
            u.archery,
            u.ropes,
            u.senior,
            u.first_year
            FROM staff_sessions ss
            JOIN users u ON u.username = ss.username
            LEFT JOIN cabin_sessions cs ON cs.id = ss.cabin_assignment
            LEFT JOIN cabins cab ON cab.name = cs.cabin_name
            WHERE ss.week_number IN
            (SELECT d.week_id FROM days d JOIN periods p ON p.day_id = d.id WHERE p.id=$1)
            AND ss.id NOT IN
                (
                SELECT ss.id from staff_activities sa 
                JOIN activity_sessions acts ON acts.id = sa.activity_session_id
                JOIN staff_sessions ss ON ss.id = sa.staff_session_id   
                WHERE sa.period_id IN (
                --list of all periods for day
                    SELECT p.id from periods p 
                    WHERE p.day_id IN (
                        SELECT 
                        p.day_id 
                        FROM periods p 
                        WHERE p.id = $1)
                    )
                GROUP BY (ss.id)
                HAVING COUNT(sa.staff_session_id) >= $2
                )
            AND ss.id NOT IN
                (
                SELECT ss.id from staff_activities sa
                JOIN staff_sessions ss ON ss.id = sa.staff_session_id
                JOIN activity_sessions acts ON acts.id = sa.activity_session_id
                WHERE acts.period_id = $1
                )
        ORDER BY u.first_name
        `
        const values = [periodId, MAX_DAILY_ASSIGNMENTS];
        const results = await fetchMany(query, values);
        if (!results) { return [] }
        //** Map to camelCase fields */
        return results.map(r => ({
            username: r.username,
            firstName: r.first_name,
            cabinAssignment: r.cabin_assignment_name,
            cabinSessionId: r.cabin_session_id,
            lastName: r.last_name,
            lifeguard: r.lifeguard,
            archery: r.archery,
            ropes: r.ropes,
            senior: r.senior,
            firstYear: r.first_year,
            staffSessionId: r.staff_session_id

        }))
    }
}
module.exports = StaffSession;
