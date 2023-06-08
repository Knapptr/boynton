const pool = require("../db");
const {
    fetchMany,
    fetchOne,
} = require("../utils/pgWrapper");
const Cabin = require("./cabin");
const mapManyToOne = require("../utils/remap");

class CamperWeek {
    constructor({
        id,
        firstName,
        lastName,
        dayCamp,
        pronouns,
        fl,
        age,
        gender,
        weekNumber,
        weekTitle,
        camperId,
        cabinSessionID,
        cabinName,
        activities,
    }) {
        this.weekNumber = weekNumber;
        this.gender = gender;
        this.pronouns = pronouns
        this.dayCamp = dayCamp;
        this.fl = fl;
        this.age = age;
        this.firstName = firstName;
        this.lastName = lastName;
        this.weekTitle = weekTitle;
        this.camperId = camperId;
        this.id = id;
        this.cabinSessionID = cabinSessionID;
        this.cabinName = cabinName || "unassigned";
        this.activities = activities;
    }
    static _parseResults({
        id,
        camper_id,
        day_camp,
        fl,
        first_name,
        last_name,
        age,
        gender,
        week_number,
        week_title,
        cabin_session_id,
        cabin_name,
        camper_activity_id,
        activity_id,
        period_id,
        activity_name,
        pronouns,
        activity_description,
    }) {
        return {
            id: id,
            camperId: camper_id,
            dayCamp: day_camp,
            pronouns: pronouns,
            fl: fl,
            firstName: first_name,
            lastName: last_name,
            age: age,
            gender: gender,
            weekNumber: week_number,
            weekTitle: week_title,
            cabinSessionID: cabin_session_id,
            cabinName: cabin_name,
            camperActivityID: camper_activity_id,
            activityID: activity_id,
            periodID: period_id,
            activityName: activity_name,
            activityDescription: activity_description,
        };
    }
    static async getAll() {
        const query = `
			SELECT 
			cw.id,
      cw.day_camp,
			cw.camper_id,c.first_name,c.last_name,c.pronouns, c.age,c.gender,cw.fl,
			w.number as week_number,w.title as week_title,
			cw.cabin_session_id,cab.name as cabin_name,
			ca.id as camper_activity_id,ca.activity_id as activity_id,ca.period_id,
			a.name as activity_name, a.description as activity_description

			FROM camper_weeks cw
			JOIN weeks w ON w.number = cw.week_id
			LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
			LEFT JOIN cabins cab ON cab.name = cs.cabin_name
			JOIN campers c ON c.id = cw.camper_id
			LEFT JOIN camper_activities ca ON ca.camper_week_id = cw.id
			LEFT JOIN activities a ON a.id = ca.activity_id

                        ORDER BY c.age, c.last_name

		`;
        const dbResult = await fetchMany(query);
        if (!dbResult) { return [] }
        const parsedResult = dbResult.map((oneResult) =>
            CamperWeek._parseResults(oneResult)
        );
        const remappedCamperWeeks = mapManyToOne({
            array: parsedResult,
            identifier: "id",
            newField: "activities",
            fieldsToMap: [
                "camperActivityID",
                "activityID",
                "periodID",
                "activityName",
                "activityDescription",
            ],
            fieldsToRemain: [
                "id",
                "camperId",
                "dayCamp",
                "fl",
                "pronouns",
                "firstName",
                "lastName",
                "age",
                "gender",
                "weekNumber",
                "weekTitle",
                "cabinSessionID",
                "cabinName",
            ],
        });
        const camperWeeks = remappedCamperWeeks.map((cw) => new CamperWeek(cw));
        return camperWeeks;
    }
    static async getOne(id) {
        const query = `
			SELECT 
			cw.id,
			cw.camper_id,c.first_name,c.last_name, cw.fl, c.age,c.gender, c.pronouns,
			w.number as week_number,w.title as week_title,
			cw.cabin_session_id,cab.name as cabin_name,
			ca.id as activity_id,ca.period_id,
			a.name as activity_name, a.description as activity_description

			FROM camper_weeks cw
			JOIN weeks w ON w.number = cw.week_id
			LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
			LEFT JOIN cabins cab ON cab.name = cs.cabin_name
			JOIN campers c ON c.id = cw.camper_id
			LEFT JOIN camper_activities ca ON ca.camper_week_id = cw.id
			LEFT JOIN activities a ON a.id = ca.activity_id
			WHERE cw.id = $1

		`;
        const values = [id];
        const dbResult = await fetchMany(query, values);
        if (!dbResult) { return false };
        const parsedResult = dbResult.map((oneResult) =>
            CamperWeek._parseResults(oneResult)
        );
        const remappedCamperWeeks = mapManyToOne({
            array: parsedResult,
            identifier: "id",
            newField: "activities",
            fieldsToMap: [
                "camperActivityID",
                "activityID",
                "periodID",
                "activityName",
                "activityDescription",
            ],
            fieldsToRemain: [
                "id",
                "camperId",
                "dayCamp",
                "fl",
                "firstName",
                "pronouns",
                "lastName",
                "age",
                "gender",
                "weekNumber",
                "weekTitle",
                "cabinSessionID",
                "cabinName",
            ],
        });
        const camperWeeks = remappedCamperWeeks.map((cw) => new CamperWeek(cw));
        return camperWeeks[0];
    }
    async assignCabin(cabinSessionID) {
        const query =
            "UPDATE camper_weeks SET cabin_session_id = $1 WHERE id=$2";
        const values = [cabinSessionID, this.id];
        await pool.query(query, values);
        const cabinQuery =
            "SELECT cabins.name,cabins.capacity from cabin_sessions JOIN cabins ON cabins.name = cabin_sessions.cabin_name WHERE cabin_sessions.id = $1";
        const cabinValues = [cabinSessionID];
        const cabin = await fetchOne(cabinQuery, cabinValues);
        const assignedCabin = {
            name: cabin.name,
            capacity: cabin.capacity,
            session: cabinSessionID,
        };
        this.cabin = assignedCabin;
        return assignedCabin;
    }
}

module.exports = CamperWeek;
