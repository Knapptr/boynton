const pool = require("../db");

class Award {
    constructor({ id, reason, weekNumber, camperFirstName, camperLastName, programArea }) {
        this.id = id
        this.reason = reason;
        this.weekNumber = weekNumber;
        this.camperFirstName = camperFirstName;
        this.camperLastName = camperLastName;
        this.programArea = programArea;
    }
    /** insert awards to db
        * @param awards {Object[]} award data {camperSessionId,programAreaId,reason}
        */
    static async create(awards) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const allReqs = awards.map(aw => {
                const query = "INSERT INTO awards (reason,program_area_id,camper_session_id) VALUES ($1,$2,$3) RETURNING *";
                const values = [aw.reason, aw.programAreaId, aw.camperSessionId];
                return client.query(query, values);
            })
            const results = await Promise.all(allReqs);
            await client.query("COMMIT");
            return results.map(r => ({
                id: r.rows[0].id,
                camperSessionId: r.rows[0].camper_session_id,
                programAreaId: r.rows[0].program_area_id
            }))
        } catch (e) {
            client.query("ROLLBACK");
            throw e;
        } finally {
            client.release()
        }
    }

    static async getAll() {
        const query = `
        SELECT
        award.id as id,
        award.reason,
        cw.week_id as week_number,
        camp.first_name as camper_first_name,
        camp.last_name as camper_last_name,
        pa.name as program_area_name
        FROM 
        awards award
        JOIN camper_weeks cw ON cw.id = award.camper_session_id
        JOIN campers camp ON camp.id = cw.camper_id
        JOIN program_areas pa ON pa.id = award.program_area_id
        `
        const results = await pool.query(query);
        return results.rows.map(aw => new Award({
            reason: aw.reason,
            weekNumber: aw.week_number,
            camperFirstName: aw.camper_first_name,
            camperLastName: aw.camper_last_name,
            programArea: aw.program_area_name
        }))
    }

}

module.exports = Award;
