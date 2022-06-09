const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const weekRepository = {
  _mapResponse(dbResponse) {
    return dbResponse.reduce((acc, cv) => {
      const currentWeek = acc.find((w) => w.id === cv.id) || {};
      currentWeek.title = currentWeek.title || cv.title;
      currentWeek.number = currentWeek.number || cv.number;
      currentWeek.days = currentWeek.days || [];
      if(cv.day_id){

      const dayInWeek = currentWeek.days.find((d) => d.id === cv.day_id) || {
        id: cv.day_id,
        name: cv.day_name,
        periods: [],
      };
      dayInWeek.periods.push({ number: cv.period_number, id: cv.period_id });
      if (!currentWeek.days.find((d) => d.id === cv.day_id)) {
        currentWeek.days.push(dayInWeek);
      }
      }
      if (acc.find((w) => w.id === cv.id)) {
        return acc;
      }
      acc.push(currentWeek);
      return acc;
    }, []);
  },
  async getAll() {
    const query = `SELECT 
    w.title AS title,
      w.number AS number,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    `;
    const responseData = await fetchMany(query);
    const mappedData = this._mapResponse(responseData);
    return mappedData;
  },
  async get(weekNumber) {
    const query = `SELECT 
    w.title AS title,
      w.number AS number,
      d.id AS day_id,
      d.name AS day_name,
      p.id AS period_id,
      p.period_number AS period_number
    FROM weeks w
    JOIN days d ON d.week_id = w.number
    JOIN periods p ON p.day_id = d.id  
    WHERE w.number = $1
    `;
    const values = [weekNumber];
    const responseData = await fetchMany(query, values);
    if (!responseData) {
      return false;
    }
    const mappedData = this._mapResponse(responseData);
    return mappedData[0];
  },

  async delete(weekNumber){
    const query = "DELETE FROM weeks WHERE number = $1 RETURNING *"
    const values = [weekNumber];
    const deletedWeek = await fetchOne(query,values);
    return deletedWeek;
  },
  //work on this method, this is garbage
  async create({ title, number, days=[] }) {
    //YIKES this needs to be refactored TODO
    const weekQuery = `INSERT INTO weeks (title,number) VALUES ($1,$2) RETURNING *`;
    const weekValues = [title, number];
    const insertWeekResponse = await fetchOne(weekQuery, weekValues);
    const weekId = insertWeekResponse.number;
    const dayInserts = days.map(async requestDay=>{
      const dayQuery = "INSERT INTO days (name,week_id) VALUES($1,$2) RETURNING *";
      const dayValues = [requestDay.name,weekId];
      const dayResponse = await fetchOne(dayQuery,dayValues);
      return {id: dayResponse.id,name:dayResponse.name,numberOfPeriods:requestDay.numberOfPeriods};
    })
    const insertedDays = await Promise.all(dayInserts) 
    const periodInserts = insertedDays.map(insertedDay=>{
      return Promise.all(
        Array.from(Array(insertedDay.numberOfPeriods),(v,i)=>{
          const periodQuery = "INSERT INTO periods (day_id,period_number) VALUES ($1,$2) RETURNING *"
          const periodValues = [insertedDay.id,i+1]
          return fetchOne(periodQuery,periodValues);
        })
      )
    }) 
    const insertedPeriods = await Promise.all(periodInserts)
    const flattenedPeriodInserts =  insertedPeriods.reduce((acc,cv)=>[...acc,...cv],[] );
    let results = flattenedPeriodInserts.map(insertedPeriod=>{
      const day = insertedDays.find(d=>d.id === insertedPeriod.day_id);
      return {title,number,day_id:day.id,day_name:day.name,period_id:insertedPeriod.id,period_number:insertedPeriod.number};
    }) 
    if ( results.length ===0 ){
      results = [{title,number,days}]
    }
    const week = this._mapResponse(results);
    return week[0]
  },
};

module.exports = weekRepository;
