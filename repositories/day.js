const { fetchOne, fetchMany } = require("../utils/pgWrapper");

const createTableQuery = `CREATE TABLE IF NOT EXISTS days
(
    name character varying(3) COLLATE pg_catalog."default",
    id integer NOT NULL DEFAULT nextval('day_id_seq'::regclass),
    week_id integer NOT NULL DEFAULT nextval('day_week_id_seq'::regclass),
    CONSTRAINT day_pkey PRIMARY KEY (id),
    CONSTRAINT week_id_name FOREIGN KEY (week_id)
        REFERENCES public.weeks ("number") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)`;

module.exports = {
async init(){
 try{
await fetchMany(createTableQuery)
   return true
 }catch(e){
   return false
 }
},

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
