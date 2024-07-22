const pool = require("../db");

class ActivityLocation{
  constructor({name}){
    this.name = name;
  }
  static async getAll(){
    const query = "SELECT name FROM activity_locations";
    const result = await pool.query(query);
    return result.rows.map(r=>new ActivityLocation({name:r.name}))
  }
}

module.exports = ActivityLocation;
