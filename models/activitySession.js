const { fetchOne, fetchMany } = require("../utils/pgWrapper");

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
            return []
        }
    }
    async addCamper(camperID) {
        const query = `
         INSERT INTO camper_activities (camper_week_id,activity_id,period_id) 
            VALUES ($1,$2,$3) 
            ON CONFLICT ON CONSTRAINT one_activity_per_camper 
            DO UPDATE set activity_id = $2 ,period_id = $3, is_present = false 
            RETURNING id, period_id,activity_id`
        const values = [camperID, this.id, this.periodId];
        const result = await fetchOne(query, values);
        const camperActivityID = result.id;
        return camperActivityID;
    }

}

module.exports = ActivitySession;
