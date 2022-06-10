const { fetchOne, fetchMany } = require("../utils/pgWrapper");
module.exports = {
  _mapResponse(dbResponse) {
    return dbResponse.reduce((acc, cv) => {
      const camperExists = acc.find((c) => c.id === cv.id);
      const currentCamper = camperExists ? camperExists : {};
      currentCamper.firstName = currentCamper.firstName || cv.first_name;
      currentCamper.lastName = currentCamper.lastName || cv.last_name;
      currentCamper.gender = currentCamper.gender || cv.gender;
      currentCamper.age = currentCamper.age || cv.age;
      currentCamper.id = currentCamper.id || cv.id;
      currentCamper.weeks = currentCamper.weeks || [];
      let weekSession = currentCamper.weeks.find(
        (w) => w.number === cv.week_number
      );
      if (!weekSession) {
        currentCamper.weeks.push({
          number: cv.week_number,
          title: cv.week_title,
          id: cv.camper_week_id,
          cabinSessionId: cv.cabin_session_id || null,
          cabinName: cv.cabin_name || null,
        });
      }
      if (!camperExists) {
        acc.push(currentCamper);
        return acc;
      }
      return acc;
    }, []);
  },
  async getAll() {
    const query = `SELECT 
     c.first_name,
     c.last_name ,
     c.gender,c.id,c.age,
     w.number AS week_number, w.title AS week_title,
     cw.id AS camper_week_id,
     cw.cabin_session_id AS cabin_session_id,
     cab.name AS cabin_name
     FROM campers c
     JOIN camper_weeks cw ON cw.camper_id = c.id
     JOIN weeks w ON cw.week_id = w.number
     LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id 
     LEFT JOIN cabins cab ON cs.cabin_name = cab.name `;
    const dbResponse = await fetchMany(query);
    const mappedResponse = this._mapResponse(dbResponse);
    return mappedResponse;
  },
  async getOne(id){
    const query = `SELECT 
     c.first_name,
     c.last_name ,
     c.gender,c.id,c.age,
     w.number AS week_number, w.title AS week_title,
     cw.id AS camper_week_id,
     cw.cabin_session_id AS cabin_session_id,
     cab.name AS cabin_name
     FROM campers c
     JOIN camper_weeks cw ON cw.camper_id = c.id
     JOIN weeks w ON cw.week_id = w.number
     LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id 
     LEFT JOIN cabins cab ON cs.cabin_name = cab.name 
     WHERE c.id = $1
    `;
    const values = [id]
    const dbResponse = await fetchMany(query,values);
    const mappedResponse = this._mapResponse(dbResponse);
    return mappedResponse[0]

  },
  async create({firstName,lastName,age,gender,id}){
    const query = `
      INSERT INTO campers (id,first_name,last_name,age,gender)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT ON CONSTRAINT camper_pkey
      DO UPDATE
      SET 
      first_name = $2,
      last_name = $3,
      age = $4,
      RETURNING *
    `
    const values = [id,firstName,lastName,age,gender]
    const result = await fetchOne(query,values);
    if(!result){return false};
    return {
      firstName: result.first_name,
      lastName: result.last_name,
      age: result.age,
      gender: result.gender,
      weeks: []
    }

  }
};
