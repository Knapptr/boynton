const pool = require("../db");
const defaultWeekRepository = require("../repositories/week");
const DbError = require("../utils/DbError");

class Week {
  constructor(
    { title, begins, ends, number, days = [], display },
    weekRepository = defaultWeekRepository
  ) {
    if (!title || !number) {
      throw new Error("Cannot create Week, title,number required");
    }
    this.title = title;
    this.display = display || number - 1; // To handle "Taste of camp"
    this.days = days;
    this.number = number;
    this._weekRepository = weekRepository;
    this.begins = begins;
    this.ends = ends;
  }
  toJSON() {
    return {
      title: this.title,
      number: this.number,
      days: this.days,
      begins: this.begins,
      ends: this.ends,
      display: this.display,
    };
  }
  async delete() {
    const deletedWeek = await this._weekRepository.delete(this.number);
    if (deletedWeek) {
      return true;
    }
    return false;
  }

  static async getOnDate(date, getStaff = false) {
    const week = await defaultWeekRepository.getOnDate(date, getStaff);
    return week;
  }
  static async get(
    weekNumber,
    getStaff = false,
    weekRepository = defaultWeekRepository
  ) {
    const client = await pool.connect();
    try {
      const weekDataQuery = "SELECT * from weeks WHERE number = $1";
      const weekDataValues = [weekNumber];
      const weekDataResponse = await client.query(
        weekDataQuery,
        weekDataValues
      );
      if (weekDataResponse.rowCount === 0) {
        return false;
      }
      const { title, number, begins, ends, display } = weekDataResponse.rows[0];
      const scheduleQuery = `
        SELECT 
        d.name as day_name,
        d.id as day_id,
        per.id as period_id,
        per.period_number as period_number,
        per.day_id as period_day,
        actsess.id as activity_session_id,
        act.name as activity_name,
        act.description as activity_description
        FROM
        days d 
        JOIN periods per ON per.day_id = d.id
        LEFT JOIN activity_sessions actsess ON actsess.period_id = per.id
        LEFT JOIN activities act ON act.id = actsess.activity_id
        WHERE d.week_id = $1
        ORDER BY day_id, period_number
      `;
      const scheduleData = [weekNumber];
      const rawScheduleResults = await client.query(
        scheduleQuery,
        scheduleData
      );
      // create a map of schedule days(in order)[{periods(inOrder)[activities[]}
      const days = rawScheduleResults.rows.reduce((mappedSchedule, data) => {
        // if this is the first entry, add the data to the schedlue
        if (mappedSchedule.length === 0) {
          const initInfo = {
            name: data.day_name,
            id: data.day_id,
            periods: [
              {
                id: data.period_id,
                number: data.period_number,
                activities: [],
              },
            ],
          };
          mappedSchedule.push(initInfo );
        }
        // check if the last element is the same day as the current day
        const currentDay =
          mappedSchedule[mappedSchedule.length - 1].id === data.day_id
            ? mappedSchedule.pop()
            : {
                name: data.day_name,
                id: data.day_id,
                periods: [
                  {
                    id: data.period_id,
                    number: data.period_number,
                    activities: [],
                  },
                ],
              };
        // check if last period is same as current period
        const currentPeriod = currentDay.periods[currentDay.periods.length - 1].id === data.period_id?currentDay.periods.pop():{
          id:data.period_id,
          number: data.period_number,
          activities:[]
        }
        // check if there is activity information
        if(data.activity_session_id){
          currentPeriod.activities.push({
            name: data.activity_name,
            sessionId: data.activity_session_id,
            description: data.activity_description,
          })
        }
        // re assemble current day
        currentDay.periods.push(currentPeriod);
        //push the current day onte the schedule
        mappedSchedule.push(currentDay);

        return mappedSchedule;
      }, []);
      // LOTS of queries here. get all campers and staff for every activity
      await Promise.all(days.map(async d=>{
        return Promise.all(d.periods.map(async p=>{
          return Promise.all(p.activities.map(async a=>{
             const camperQuery = `
              SELECT 
              camp.id,
              cweek.id as camper_week_id,
              camp.first_name as first_name,
              camp.last_name as last_name,
              camp.age as age,
              camp.pronouns as pronouns,
              cact.is_present as is_present,
              cweek.day_camp as day_camp,
              cweek.fl as fl
              from camper_activities cact
              JOIN camper_weeks cweek ON cweek.id = cact.camper_week_id
              JOIN campers camp on camp.id = cweek.camper_id
              WHERE cact.activity_id= $1
            ` 
            const camperQueryValues = [a.sessionId]
            const staffQuery = `
              SELECT 
              ss.id as staff_session_id,
              us.first_name as first_name,
              us.last_name as last_name,
              us.username as username
              from staff_on_periods sop
              JOIN staff_sessions ss ON ss.id = sop.staff_session_id
              JOIN users us ON us.username = ss.username
              WHERE sop.activity_session_id= $1
            `
            const staffQueryValues = [a.sessionId]
            const camperResults = await client.query(camperQuery,camperQueryValues);
            const staffResults = await client.query(staffQuery,staffQueryValues);
            const staff = staffResults.rows.map(s=>{
              return {
                firstName: s.first_name,
                lastName: s.last_name,
                username: s.username,
                sessionId: s.staff_session_id
              }
            })
            const campers = camperResults.rows.map(c=>{
              return {
                firstName: c.first_name,
                lastName: c.last_name,
                age: c.age,
                pronouns: c.pronouns,
                isPresent: c.is_present,
                id: c.id,
                dayCamp: c.day_camp,
                fl: c.fl,
                camperWeekId: c.camper_week_id
              }
            })
          
            a.campers = campers;
            a.staff = staff;
            return {campers,staff};
          }))
        }))
      }))
      await client.query("COMMIT");
      return new Week(
        {title,begins,ends,number,display,days}
      )
    } catch (e) {
      client.query("ROLLBACK");
      console.log("Error getting week", e);
      return false;
    } finally {
      client.release();
    }
    const week = await weekRepository.get(weekNumber, getStaff);
    if (!week) {
      return false;
    }
    return new Week(week);
  }
  static async getAll(
    getStaff = false,
    weekRepository = defaultWeekRepository
  ) {
    const weeks = await weekRepository.getAll(getStaff);
    return weeks.map((weekData) => new Week(weekData));
  }
  static async create(
    { title, number, begins, ends },
    weekRepository = defaultWeekRepository
  ) {
    const weekResponse = await weekRepository.create({
      title,
      number,
      begins,
      ends,
    });
    return new Week(weekResponse);
  }
  async clearCabins(area) {
    const query = `
		UPDATE camper_weeks 
		SET cabin_session_id = NULL WHERE week_id = $1
		AND cabin_session_id IN (
		SELECT cs.id
		FROM cabins cab 
		JOIN cabin_sessions cs ON cs.cabin_name = cab.name 
		WHERE cs.week_id= $1 AND cab.area = $2)
		RETURNING * `;
    const values = [this.number, area];
    const result = await pool.query(query, values);
    return result.rows;
  }
  async assignStaffToPeriodNumber(periodNumber, staffSessionList) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allReqs = staffSessionList.map(async (s) => {
        const query = `
	  INSERT INTO staff_on_periods (staff_session_id,period_id) 
	  SELECT $1, pe.id FROM periods pe
	  JOIN days d ON d.id = pe.day_id
	  JOIN weeks w ON w.number = d.week_id
	  WHERE w.number = $2 AND pe.period_number = $3
	  RETURNING * `;

        const values = [s.id, this.number, periodNumber];
        const result = await client.query(query, values);
        if (result.rowCount === 0) {
          throw new Error("Could not add staff to period");
        }
        return result.rows.map((r) => {
          const {
            id,
            staff_session_id: staffSessionId,
            period_id: periodId,
          } = r;
          return { id, staffSessionId, periodId };
        });
      });
      const allResults = await Promise.all(allReqs);
      client.query("COMMIT");
      return allResults;
    } catch (e) {
      client.query("ROLLBACK");
      throw DbError.transactionFailure(
        `Could not assign staff to periods: ${e}`
      );
    } finally {
      client.release();
    }
  }

  async unassignStaffToPeriodNumber(periodNumber, staffSessionList) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const allReqs = staffSessionList.map(async (s) => {
        const query = `
	  DELETE FROM staff_on_periods op
	  WHERE  op.period_id IN (SELECT 
	   periods.id 
	   FROM periods 
	   JOIN days d ON d.id = periods.day_id
	   WHERE periods.period_number = $3 AND d.week_id = $2)  
	  AND op.staff_session_id = $1
	  RETURNING * `;

        const values = [s.id, this.number, periodNumber];
        const result = await client.query(query, values);
        if (result.rowCount === 0) {
          throw new Error("Could not remove staff from periods");
        }
        return result.rows.map((r) => {
          const {
            id,
            staff_session_id: staffSessionId,
            period_id: periodId,
          } = r;
          return { id, staffSessionId, periodId };
        });
      });
      const allResults = await Promise.all(allReqs);
      client.query("COMMIT");
      return allResults;
    } catch (e) {
      client.query("ROLLBACK");
      throw DbError.transactionFailure(
        `Could not assign staff to periods: ${e}`
      );
    } finally {
      client.release();
    }
  }
}
module.exports = Week;
