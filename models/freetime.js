const pool = require("../db");

class Freetime{
  constructor(number,dayId,id){
    this.number = number,
    this.dayId = dayId,
    this.id = id
  }

  static async create(number,dayId){
    const query = 'INSERT INTO freetimes (number,day_id) VALUES ($1,$2) RETURNING *';
    const values = [number,dayId];
    const response = await pool.query(query,values);
    if(response.rowCount === 0){throw new Error("Error creating freetime")};
    const {number,day_id:dayId,id} = response.rows[0];
    return new Freetime(number,dayId,id);
  }

  static async get(id){
    const query = "SELECT * from freetimes WHERE id = $1";
    const values  = [id];
    const response = await pool.query(query,values);
    if(response.rowCount === 0){throw new Error(`Freetime with id ${id} not found`)}
    const {number,day_id:dayId,id} = response.rows[0];
    return new Freetime(number,dayId,id);
  }

  // Have not created staff_freetimes yet
  // async assignStaff(staffList){
  //   const query = "INSERT INTO staff"
  // }
}
module.exports = Freetime ;
