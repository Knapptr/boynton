const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater  = require("docxtemplater");
const pool = require("../db");
const path = require("path");

class Award {
    constructor({ id, reason, weekNumber, camperFirstName, camperLastName, programArea,weekTitle,weekDisplay }) {
        this.id = id
        this.reason = reason;
        this.weekNumber = weekNumber;
        this.weekTitle = weekTitle;
        this.weekDisplay = weekDisplay
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

    static async getByWeek(weekNumber) {
        const query = `
        SELECT
        award.id as id,
        award.reason,
        w.number as week_number,
        w.title as week_title,
        w.display as week_display,
        camp.first_name as camper_first_name,
        camp.last_name as camper_last_name,
        pa.name as program_area_name
        FROM 
        awards award
        JOIN camper_weeks cw ON cw.id = award.camper_session_id
        JOIN weeks w ON w.number = cw.week_id
        JOIN campers camp ON camp.id = cw.camper_id
        JOIN program_areas pa ON pa.id = award.program_area_id
        WHERE w.number = $1
        `
        const values = [weekNumber]
        const results = await pool.query(query,values);
        return results.rows.map(aw => new Award({
            id: aw.id,
        reason: aw.reason,
            weekNumber: aw.week_number,
            weekTitle: aw.week_title,
            weekDisplay: aw.week_display,
            camperFirstName: aw.camper_first_name,
            camperLastName: aw.camper_last_name,
            programArea: aw.program_area_name
        }))
    }
    static async getAll() {
        const query = `
        SELECT
        award.id as id,
        award.reason,
        w.number as week_number,
        w.title as week_title,
        w.display as week_display,
        camp.first_name as camper_first_name,
        camp.last_name as camper_last_name,
        pa.name as program_area_name
        FROM 
        awards award
        JOIN camper_weeks cw ON cw.id = award.camper_session_id
        JOIN weeks w ON w.number = cw.week_id
        JOIN campers camp ON camp.id = cw.camper_id
        JOIN program_areas pa ON pa.id = award.program_area_id
        `
        const results = await pool.query(query);
        return results.rows.map(aw => new Award({
            id: aw.id,
        reason: aw.reason,
            weekNumber: aw.week_number,
            weekTitle: aw.week_title,
            weekDisplay: aw.week_display,
            camperFirstName: aw.camper_first_name,
            camperLastName: aw.camper_last_name,
            programArea: aw.program_area_name
        }))
    }
    static async getGrouped(weekNumber){
        const awards = await Award.getByWeek(weekNumber);
        return awards.reduce((groups,award)=>{
            const programArea = award.programArea
            if(!groups[programArea]){groups[programArea] = []};
            groups[programArea].push(award)
            return groups
        },{})
    }

     toTemplateBuffer = async (templateFileName)=>{
        const content = fs.readFileSync(
            path.resolve("templates",templateFileName),
            "binary"
        )
        const zip = new PizZip(content)

         const doc = new Docxtemplater(zip, {
             paragraphLoop: true,
             linebreaks: true
         })
         doc.render({
             firstName: this.camperFirstName,
             lastName: this.camperLastName,
             awardFor: this.reason,
            weekNumber: this.weekDisplay,
             weekTitle: this.weekTitle

         })
         const buffer = doc.getZip().generate({
             type:"nodebuffer",
             compression: "DEFLATE"
         })

         return buffer
    }

}

module.exports = Award;
