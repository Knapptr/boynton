const pool = require("../db");
const DbError = require("../utils/DbError");
const { fetchMany, fetchOne } = require("../utils/pgWrapper");
const MAX_DAILY_ASSIGNMENTS = process.env.MAX_DAILY_ASSIGNMENTS || 2;
const StaffSession = {
  async getOnPeriod(periodId){
    const query = `
      SELECT 
      us.username as username,
      us.first_name as first_name,
      us.last_name as last_name,
      us.lifeguard as lifeguard,
      us.archery as archery,
      us.senior as senior,
      us.first_year as first_year,
      us.ropes as ropes,
      ss.id as staff_session_id,
      sop.activity_session_id as activity_session_id,
      activities.name as activity_name
      FROM
      staff_on_periods sop
      JOIN staff_sessions ss ON ss.id = sop.staff_session_id
    LEFT JOIN activity_sessions acts ON acts.id = aop.id
    LEFT JOIN activities on activities.id = 
      JOIN users us on us.username = ss.username
      WHERE sop.period_id=$1
        `
    const values = [periodId];
    const result = await pool.query(query,values);
    if(result.rowCount === 0){return false};
    return result.rows.map(r=>({
      username: r.username,
      firstName:r.first_name,
      lastName:r.last_name,
      lifeguard:r.lifeguard,
      archery:r.archery,
      senior:r.senior,
      firstYear:r.first_year,
      ropes:r.ropes,
      staffSessionId:r.staff_session_id,
      activityName: r.activity_name,
      activitySessionId:r.activity_session_id,
    }))
  },
  async get(id) {
    const client = await pool.connect();
    try {
      const sessionQuery = `
        SELECT 
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
        `;
      const sessionValues = [id];
      const sessionResult = await client.query(sessionQuery, sessionValues);
      if (sessionResult.rowCount === 0) {
        throw DbError.notFound("User/Staff session not found");
      }
      const rawSessionData = sessionResult.rows[0];
      const sessionData = {
        id: rawSessionData.staff_session_id,
        username: rawSessionData.username,
        firstName: rawSessionData.first_name,
        lastName: rawSessionData.last_name,
        archery: rawSessionData.archery,
        ropes: rawSessionData.ropes,
        senior: rawSessionData.senior,
        firstYear: rawSessionData.first_year,
        cabinAssignment: rawSessionData.cabin_assignment_name || "unassigned",
        cabinSessionId: rawSessionData.cabin_session_id,
      };
      //Get schedule data for session
      const onPeriodQuery = `
        SELECT
        d.week_id as week_number,
        d.name as day_name,
        d.id as day_id,
        pe.period_number as period_number,
        pe.id as period_id,
        sop.id as staff_on_period_id
        from
        staff_sessions ss
        JOIN days d ON d.week_id = ss.week_number
        JOIN periods pe ON pe.day_id = d.id
        LEFT JOIN staff_on_periods sop ON sop.period_id = pe.id AND sop.staff_session_id = $1
        WHERE ss.id = $1
        ORDER BY day_id, period_number
        `;
      const onPeriodValues = [id];
      const scheduleResults = await client.query(onPeriodQuery, onPeriodValues);
      if (scheduleResults.rowCount === 0) {
        throw DbError.notFound("Error with user schedule");
      }
      //arrange periods into schedule
      const staffSchedule = scheduleResults.rows.reduce(
        (schedule, currentPeriod) => {
          const currentDayName = currentPeriod.day_name;
          const currentPeriodInfo = {
            id: currentPeriod.period_id,
            number: currentPeriod.period_number,
            onPeriodId: currentPeriod.staff_on_period_id,
          };
          const previous = schedule.length > 0 && schedule[schedule.length - 1];
          //check if the last element on the schedule exists, and has same day id as current periods day id. If it does, add the current periods information to the last days schedule
          if (previous && previous.dayName === currentDayName) {
            previous.periods.push(currentPeriodInfo);
          }
          // The day has not yet been added, add it as a new day to the schedule
          else {
            const newDay = {
              dayName: currentDayName,
              id: currentPeriod.day_id,
              weekNumber: currentPeriod.week_number,
              periods: [currentPeriodInfo],
            };
            schedule.push(newDay);
          }
          return schedule;
        },
        []
      );
      sessionData.schedule = staffSchedule;
      await client.query("COMMIT");
      return sessionData;
    } catch (e) {
      console.log("ERROR:", { ...e });
      client.query("ROLLBACK");
      return false;
    } finally {
      client.release();
    }

    const response = await pool.query(query, values);
    const results = response.rows;
    if (results.length === 0) {
      return false;
    }

    // group into schedule
    return {
      username: response.username,
      lastname: response.last_name,
      firstname: response.first_name,
      archery: response.archery,
      ropes: response.ropes,
      senior: response.senior,
      firstyear: response.first_year,
      cabinassignment: response.cabin_assignment,
      staffsessionid: response.staff_session_id,
      id: response.staff_session_id,
    };
  },
  async getsome(idlist) {
    const query = `select 
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
        from staff_sessions ss
        join users u on u.username = ss.username
        left join cabin_sessions cs on cs.id = ss.cabin_assignment
        left join cabins cab on cab.name = cs.cabin_name
        where ss.id = any ($1)`;
    const values = [idlist];
    const response = await pool.query(query, values);
    return response.rows.map((r) => ({
      staffsessionid: r.staff_session_id,
      username: r.username,
      lastname: r.last_name,
      firstname: r.first_name,
      archery: r.archery,
      ropes: r.ropes,
      senior: r.senior,
      firstyear: r.first_year,
    }));
  },
    // This would be a good use case for a class
async assignToCabin(staffSession,cabinSessionId){
    if(cabinSessionId === ""){cabinSessionId = null}
    const query = `UPDATE staff_sessions
    SET cabin_assignment = $1
    WHERE staff_sessions.id = $2
    RETURNING *`;
    const values = [cabinSessionId,staffSession.id]
    const result = await pool.query(query,values);
    if(result.rowCount ===0){return false};
    return true;

},
  async getavailableperiod(periodid) {
    const query = `
            select 
            ss.id as staff_session_id,
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
            from staff_sessions ss
            join users u on u.username = ss.username
            left join cabin_sessions cs on cs.id = ss.cabin_assignment
            left join cabins cab on cab.name = cs.cabin_name
            where ss.week_number in
            (select d.week_id from days d join periods p on p.day_id = d.id where p.id=$1)
            and ss.id not in
                (
                select ss.id from staff_activities sa 
                join activity_sessions acts on acts.id = sa.activity_session_id
                join staff_sessions ss on ss.id = sa.staff_session_id   
                where sa.period_id in (
                --list of all periods for day
                    select p.id from periods p 
                    where p.day_id in (
                        select 
                        p.day_id 
                        from periods p 
                        where p.id = $1)
                    )
                group by (ss.id)
                having count(sa.staff_session_id) >= $2
                )
            and ss.id not in
                (
                select ss.id from staff_activities sa
                join staff_sessions ss on ss.id = sa.staff_session_id
                join activity_sessions acts on acts.id = sa.activity_session_id
                where acts.period_id = $1
                )
        order by u.first_name
        `;
    const values = [periodid, max_daily_assignments];
    const results = await fetchmany(query, values);
    if (!results) {
      return [];
    }
    //** map to camelcase fields */
    return results.map((r) => ({
      username: r.username,
      firstname: r.first_name,
      cabinassignment: r.cabin_assignment_name,
      cabinsessionid: r.cabin_session_id,
      lastname: r.last_name,
      lifeguard: r.lifeguard,
      archery: r.archery,
      ropes: r.ropes,
      senior: r.senior,
      firstyear: r.first_year,
      staffsessionid: r.staff_session_id,
    }));
  },
};
module.exports = StaffSession;
