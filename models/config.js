//* Made to send JSON to the server for the creation of weeks, days, periods ond users from a config file

const pool = require("../db");
const encrypt = require("../utils/encryptPassword");


/** Award Type / program area Creation Query
    * @param {client} client pg-node client
    * @param awardType award type config
    * @returns {Promise} the program area query
*/
const programAreaToQuery = async (client, programArea) => {
    const query = "INSERT INTO program_areas (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *";
    const values = [programArea.name];
    return client.query(query, values);
}
/** User Creation Query
    * @param {client} client pg-node client
    * @param user the user config
    * @returns {Promise} the user query
*/
const userToQuery = async (client, user) => {
    // hash pw
    const hashedPw = await encrypt(user.password);
    const userQuery = "INSERT INTO users (username,password,role, first_name,last_name) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING"
    const values = [user.username, hashedPw, user.role, user.firstName, user.lastName]
    return client.query(userQuery, values)
}
/** Week Creation query
    *@param {client} client The pg-node client
    *@param {week} week The week config
    *@returns {Promise} the week query
*/
const weekToQuery = (client, week) => {
    const weekQuery = "INSERT INTO weeks (title,number,begins,ends,display) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING *";
    const values = [week.title, week.number, week.begins, week.ends, week.display || week.number - 1];
    return client.query(weekQuery, values);
}

/** Day creation query
    * @param client pg-node client
    * @param day day config
    * @param weekNumber the primary key of the week being created
    * @returns {Promise} the day query 
    */
const dayToQuery = (client, day, weekNumber) => {
    const daysQuery = "INSERT INTO days (name,week_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING * ";
    const values = [day.name, weekNumber]
    return client.query(daysQuery, values);
}

/** Periods creation query
    * @param client pg-node client
    * @param periodNumber numbered period in the day
    * @param dayId the id of the day the period belongs to
    * @returns {Promise} the period query
    */
const periodToQuery = (client, period, dayId) => {
    const periodsQuery = "INSERT INTO periods (period_number,day_id,all_week) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING *";
    const values = [period.number, dayId, period.allWeek];
    return client.query(periodsQuery, values);
}

/** Cabins creation query
    * @param client pg-node client
    * @param cabin cabin config
    * @returns {Promise} the cabin query
    */
const cabinToQuery = (client, cabin) => {
    const cabinsQuery = "INSERT INTO cabins (name, capacity, area) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING *";
    const values = [cabin.name, cabin.capacity, cabin.area]
    return client.query(cabinsQuery, values);
}

/** Cabin session creation query
    * @param client pg-node client
    * @param cabinName cabin name
    * @param weekNumber week number
*/
const cabinSessionToQuery = (client, cabinName, weekNumber) => {
    const cabinSessionQuery = "INSERT INTO cabin_sessions (cabin_name, week_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *";
    const values = [cabinName, weekNumber]
    return client.query(cabinSessionQuery, values);
}

/** Create weeks, days, periods
    * @param client pg-node client,
    * @param weeks weeks array
    * @returns {Promise} all the created data
*/
const createSchedule = async (client, weeks) => {

    const scheduleQueries = weeks.map(async week => {
        // Create week
        const days = [];
        const periods = [];
        const weekResults = await weekToQuery(client, week);
        if (weekResults.rows.length === 1) {
            const allResults = week.days.map(async day => {
                const dayResult = await dayToQuery(client, day, weekResults.rows[0].number)
                if (dayResult.rows.length === 1) {

                    days.push(dayResult.rows[0]);
                    const dayId = dayResult.rows[0].id
                    // Create Periods for day
                    const periodQueries = day.periods.map((p,index)=>{
                        const period = {number:index + 1, allWeek:p.allWeek} 
                            return periodToQuery(client,period,dayId)
                    });
                    const periodResultsData = await Promise.all(periodQueries);

                    for (result of periodResultsData) {
                        periods.push(result.rows[0]);
                    }
                }

            });

            await Promise.all(allResults);
            const createdWeek = { number: week.number, title: week.title, begins: week.begins, ends: week.ends, days, periods }
            return createdWeek;
        }
        return false
    })
    const allQ = await Promise.all(scheduleQueries);
    return allQ;
}


class Config {
    static async load({ weeks, cabins, users, programAreas }) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Create all weeks
            const createdWeeks = await createSchedule(client, weeks);
            console.log("Created Weeks")



            // Create all cabins
            console.log("Creating Cabins");
            const createdCabinsData = await Promise.all(cabins.map(cabin => cabinToQuery(client, cabin)));


            const createdCabins = createdCabinsData.reduce((acc, cv) => {
                acc = acc.concat(cv.rows); return acc
            }, []);
            // Create all cabin Sessions
            console.log("Creating Cabin Sessions");
            const cabinSessionQueries = [];
            for (const cabin of createdCabins) {
                for (const week of createdWeeks) {
                    cabinSessionQueries.push(cabinSessionToQuery(client, cabin.name, week.number))
                }
            }
            const createdCabinSessionsData = await Promise.all(cabinSessionQueries);

            const createdCabinSessions = createdCabinSessionsData.reduce((acc, cv) => {
                acc = acc.concat(cv.rows)
                return acc
            }, [])


            // Create all users
            const createdUsersData = await Promise.all(users.map(user => userToQuery(client, user)));
            const createdUsers = createdUsersData.map(d => d.rows);

            // Create Program Areas
            const createdProgramAreaData = await Promise.all(programAreas.map(pa => programAreaToQuery(client, pa)));
            const createdProgramAreas = createdProgramAreaData.map(d => d.rows);
            // All done
            await client.query("COMMIT")

            return {
                weeks: createdWeeks,
                cabins: createdCabins,
                cabinSessions: createdCabinSessions,
                users: createdUsers,
                programAreas: createdProgramAreas
            }

        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release()
        }
    }
}

module.exports = Config;
