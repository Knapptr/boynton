const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const weekRepository = {
  _mapResponse(dbResponse) {
    return dbResponse.reduce((acc, cv) => {
      const currentWeek = acc.find((w) => {
        console.log({wnum:w.number,cvnum:cv.number})
       return w.number === cv.number}) || {};
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
      if (acc.find((w) => w.number === cv.number)) {
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
  async create({ title, number}) {
    const weekQuery = `INSERT INTO weeks (title,number) VALUES ($1,$2) RETURNING *`;
    const weekValues = [title, number];
    const insertWeekResponse = await fetchOne(weekQuery, weekValues);
    if(insertWeekResponse){ insertWeekResponse.days = [];
    }    return insertWeekResponse
  },
};

module.exports = weekRepository;
