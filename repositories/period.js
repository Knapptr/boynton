const { fetchOne, fetchMany } = require("../utils/pgWrapper");

const createTableQuery = `
CREATE TABLE IF NOT EXISTS public.periods
(
    id integer NOT NULL DEFAULT nextval('period_id_seq'::regclass),
    day_id integer NOT NULL DEFAULT nextval('period_day_id_seq'::regclass),
    period_number integer NOT NULL,
    CONSTRAINT period_pkey PRIMARY KEY (id),
    CONSTRAINT day_id FOREIGN KEY (day_id)
        REFERENCES public.days (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)
`
module.exports = {
  _mapResponse(dbResponse){
    return dbResponse.reduce((acc, cv) => {
      const currentActivity = {
        name: cv.activity_name,
        description: cv.activity_description,
        id: cv.activity_id,
      };
      const currentPeriod = acc.find((p) => p.id === cv.id);
      if (currentPeriod) {
        currentPeriod.activities.push(currentActivity);
        return acc;
      }
      acc.push({
        id: cv.id,
        number: cv.period_number,
        dayId: cv.day_id,
        activities: [currentActivity],
      });
      return acc
    }, []);
a },
  async init(){
    try {
     await fetchOne(createTableQuery) 
      return true
    } catch (e) {
     return false 
    }
  },

  async getAll() {
    const query = `
  SELECT 
  day_id,period_number,p.id, 
    a.name as activity_name,a.description as activity_description,a.id as activity_id
  FROM periods p 
  LEFT JOIN activities a ON a.period_id = p.id
`;
    const results = await fetchMany(query);
    if(!results){return []};
    const mapped = this._mapResponse(results);
    return mapped
  },
  async get(id){
const query = `SELECT 
  day_id,period_number,p.id, 
    a.name as activity_name,a.description as activity_description,a.id as activity_id
  FROM periods p 
  LEFT JOIN activities a ON a.period_id = p.id
  WHERE p.id = $1
`;
    const values = [id];
    const results = await fetchMany(query,values)
    if(!results){return false}
    return this._mapResponse(results)[0]
  },
  async create({dayId,number}){
    const query = `INSERT INTO periods (day_id,period_number) VALUES ($1,$2) RETURNING *`;
    const values = [dayId,number];
    const response = await fetchOne(query,values);
    if(!response){return false}
    return {
      id: response.id,
      number: response.period_number,
      dayId: response.day_id,
    };
  }
};
