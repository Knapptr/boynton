const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const pool = require("../db/index");
const DbError = require("../utils/DbError");

class ActivitySession {
    constructor({ name, id, description, activityId, campers, periodId }) {
        this.name = name;
        this.id = id;
        this.description = description;
        this.activityId = activityId;
        this.campers = campers;
        this.periodId = periodId;
    }
    /** Parse the results from the database response
        * @param {data response[]} dbr the response from the database array */
    static _parseResults(dbr) {
        const results = [];
        for (const response of dbr) {
            let activitySession;
            if (results.at(-1) && results.at(-1).id === response.id) {
                activitySession = results.pop();
            } else {
                activitySession = {
                    id: response.id,
                    name: response.activity_name,
                    description: response.description,
                    activityId: response.activity_id,
                    periodId: response.period_id,
                    campers: [],
                }
            }
            if (response.camper_id !== null) {
                activitySession.campers.push({
                    firstName: response.first_name,
                    lastName: response.last_name,
                    sessionId: response.session_id,
                    pronouns: response.pronouns,
                    age: response.age,
                    id: response.camper_id
                })
            }

            results.push(activitySession);
        }
        return results;
    }

    /** Get all Activity Sessions */
    static async getAll() {
        const query = `
            SELECT 
            act_s.id as id, 
            act_s.period_id as period_id,
            act.name as activity_name ,
            act.description as description,
            act.id as activity_id,
            c.first_name,
            c.last_name,
            c.age,
            c.id as camper_id,
            cw.id as session_id,
            c.pronouns as pronouns
            from activity_sessions as act_s
            JOIN activities act ON act.id = act_s.activity_id
            FULL JOIN camper_activities ca ON ca.activity_id = act_s.id
            LEFT JOIN camper_weeks  cw ON cw.id = ca.camper_week_id
            LEFT JOIN campers c ON cw.camper_id = c.id
            ORDER BY act_s.id,c.last_name
        `
        const results = await fetchMany(query);
        if (results && results.length > 0) {
            const deserResults = ActivitySession._parseResults(results).map(as => new ActivitySession(as));
            return deserResults
        } else {
            return []
        }
    }

    static async get(activitySessionId) {
        const query = `
            SELECT 
            act_s.id as id, 
            act_s.period_id as period_id,
            act.name as activity_name ,
            act.description as description,
            act.id as activity_id,
            c.first_name,
            c.last_name,
            c.age,
            c.id as camper_id,
            cw.id as session_id,
            c.pronouns as pronouns
            from activity_sessions as act_s
            JOIN activities act ON act.id = act_s.activity_id
            FULL JOIN camper_activities ca ON ca.activity_id = act_s.id
            LEFT JOIN camper_weeks  cw ON cw.id = ca.camper_week_id
            LEFT JOIN campers c ON cw.camper_id = c.id
            WHERE act_s.id = $1
            ORDER BY act_s.id,c.last_name
        `
        const values = [activitySessionId];

        const results = await fetchMany(query, values);

        if (results && results.length > 0) {
            const deserResults = ActivitySession._parseResults(results).map(as => new ActivitySession(as));
            // there should only be one result, so return it instead of an array
            return deserResults[0];
        } else {
            return false
        }
    }
    static async create(activityId, periodId) {
        const query = `
        INSERT INTO activity_sessions (activity_id, period_id) VALUES ($1, $2) RETURNING *
        `
        const values = [activityId, periodId];

        try {
            const result = await fetchOne(query, values);
            console.log({ result })
            if (!result) { throw new Error("Cannot create activity session") }
            return {
                id: result.id,
                activityId: result.activity_id,
                periodId: result.period_id
            }
        } catch (e) {
            throw e
        }

    }
    async delete() {
        const query = `
        DELETE FROM activity_sessions acts WHERE acts.id = $1
        RETURNING *
        `
        const values = [this.id];

        const result = await fetchOne(query, values);
        if (!result) { return false }
        return { id: result.id, periodId: result.period_id, activityId: result.activity_id }
    }
    async addCampers(campersList) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const queries = campersList.map(camper => {
                const query = `
         INSERT INTO camper_activities (camper_week_id,activity_id,period_id) 
            VALUES ($1,$2,$3) 
            ON CONFLICT ON CONSTRAINT one_activity_per_camper 
            DO UPDATE SET activity_id = $2 ,period_id = $3, is_present = false 
            RETURNING id, period_id,activity_id`
                const values = [camper.camperSessionId, this.id, this.periodId];
                return client.query(query, values);
            })

            const results = await Promise.all(queries);
            const camperActivities = results.map(r => {
                return {
                    periodId: r.rows[0].period_id,
                    activitySessionId: r.rows[0].activity_id,
                    id: r.rows[0].id
                }
            })
            await client.query("COMMIT")
            return camperActivities;

        } catch (e) {
            client.query("ROLLBACK");
            throw DbError.transactionFailure(e.message)
        } finally {
            client.release();
        }
    }
    async addStaff(staff) {
        const client = await pool.connect();
        try {
            client.query("BEGIN");
            const allQueries = staff.map(staffer => client.query(`INSERT INTO staff_activities (activity_session_id, staff_session_id,period_id) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT "one staff assignment per period" DO UPDATE SET activity_session_id = $1  returning *`, [this.id, staffer.staffSessionId, this.periodId]));
            const results = await Promise.all(allQueries);
            await client.query("COMMIT");
            const staffActivitySessions = results.map(r => r.rows.map(dbSession => ({
                activitySessionId: dbSession.activity_session_id,
                staffSessionId: dbSession.staff_session_id,
                id: dbSession.id
            })))
            return staffActivitySessions;
        } catch (e) {
            client.query("ROLLBACK");
            console.log("ERROR", e);
            throw DbError.transactionFailure("Staff add transaction failed");
        } finally {
            client.release();
        }
    }
}

module.exports = ActivitySession;
