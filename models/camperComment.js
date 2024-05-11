const pool = require("../db");
const { getTodayFormatted } = require("../utils/getDates");

class CamperComment {
  constructor({id,camperId,username,content,date}){
    this.id=id;
    this.camperId = camperId;
    this.username = username;
    this.content = content;
    this.date = date;
  }

  static async create({camperId,username,content}){
    content = content.trim();
    const query = `
    INSERT INTO camper_comments
    (username, camper_id, content, date)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
    RETURNING *
    `
    const date = new Date().toISOString();
    const values = [username,camperId,content,date ];

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
    const {id, username,content,date,camper_id:camperId} = result.rows[0];
    return new CamperComment({id, username,content,date,camperId});

  }
  async delete(){
    const query = "DELETE FROM camper_comments WHERE id = $1 RETURNING *";
    const values = [this.id];

    const result = await pool.query(query,values);
    return result.rows[0];
  }
}

module.exports = CamperComment;
