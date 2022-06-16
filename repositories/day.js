const { fetchOne, fetchMany } = require("../utils/pgWrapper");

module.exports = {
  async getAll() {
    const query = "SELECT * from days";
    const response = await fetchMany(query);
    if(!response){return []}
    return response.map((d) => ({
      name: d.name,
      id: d.id,
      weekNumber: d.week_id,
    }));
  },
  async getOne(id){
    const query = "SELECT * from days WHERE id = $1"
    const values = [id];
    const result = await fetchOne(query,values);
    if(!result){return false}
    return {
      id: result.id,
      name: result.name,
      weekNumber: result.week_id
    }
  },
  async create({name,weekNumber}){
    const query = "INSERT INTO days (name,week_id) VALUES ($1,$2)";
    const values = [name,weekNumber];
    const result = await fetchOne(query,values);
    if(!result){return false}
    return {
      id: result.id,
      name: result.name,
      weekNumber: result.week_id
    };
  }
  
};
