const pool = require("../db");
const { getTodayFormatted } = require("../utils/getDates");

class CamperComment {
  constructor({id,camperId,username,content,date,dueDate}){
    this.id=id;
    this.camperId = camperId;
    this.username = username;
    this.content = content;
    this.dueDate = dueDate;
    this.date = date;
  }

  static async create({camperId,username,content,dueDate}){
    content = content.trim();
    const query = `
    INSERT INTO camper_comments
    (username, camper_id, content, date,due_date)
    VALUES ($1, $2, $3, $4,$5)
    ON CONFLICT DO NOTHING
    RETURNING *
    `
    const date = new Date().toISOString();
    const values = [username,camperId,content,date, dueDate ];

    const result = await pool.query(query,values);
    console.log({result});

// this should actually return a Comment
   return result.rows[0];

  }

  static async get(reqId){
    const query = "SELECT * FROM camper_comments WHERE id = $1";
    const values = [reqId];
    const result = await pool.query(query,values);
    if(result.rowCount === 0 ){
      return false
    }
    const {id, username,content,date,camper_id:camperId,due_date: dueDate} = result.rows[0];
    return new CamperComment({id, username,content,date,camperId,dueDate});

  }
  async delete(){
    const query = "DELETE FROM camper_comments WHERE id = $1 RETURNING *";
    const values = [this.id];

    const result = await pool.query(query,values);
    return result.rows[0];
  }

  static async getTwoDays(){
    const query = "SELECT * from camper_comments JOIN campers ON campers.id = camper_comments.camper_id WHERE due_date = CURRENT_DATE OR due_date = CURRENT_DATE + INTERVAL '1 day'"
    const result = await pool.query(query);
    return result.rows;
  }
}


module.exports = CamperComment;
