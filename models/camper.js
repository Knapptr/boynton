const pool = require("../db");
const defaultCamperRepository = require("../repositories/camper");

class Camper {
  constructor(
    {
      firstName,
      lastName,
      pronouns,
      gender,
      id,
      age,
      weeks = [],
      comments = [],
    },
    camperRepository = defaultCamperRepository
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.weeks = weeks;
    this.gender = gender;
    this.pronouns = pronouns;
    this.id = id;
    this.age = age;
    this.camperRepository = camperRepository;
    this.comments = comments;
  }
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      pronouns: this.pronouns,
      gender: this.gender,
      weeks: this.weeks,
      comments: this.comments,
    };
  }
  static async getByWeek(weekNumber) {
    const query = `
	  SELECT
camp.first_name,
camp.last_name,
camp.age,
camp.pronouns,
camp.id as camper_id,
gender as gender,
cw.cabin_session_id as cabin_session_id,
cw.id as camper_session_id,
cabin.name AS cabin_assignment
from campers camp
JOIN camper_weeks cw ON cw.camper_id = camp.id
LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
LEFT JOIN cabins cabin ON cabin.name = cs.cabin_name
WHERE cw.week_id = $1
ORDER BY camp.last_name, camp.first_name, camp.age
	  `;
    const values = [weekNumber];

    const results = await pool.query(query, values);
    // TODO error handling

    return results.rows.map((r) => ({
      firstName: r.first_name,
      lastName: r.last_name,
      age: r.age,
      gender: r.gender,
      pronouns: r.pronouns,
      cabinSessionId: r.cabin_session_id,
      cabinAssignment: r.cabin_assignment,
      sessionId: r.camper_session_id,
      id: r.camper_id,
    }));
  }
  async save() {
    const response = await this.camperRepository.create({
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      gender: this.gender,
      id: this.id,
    });
    return response;
  }
  static async getAll(camperRepository = defaultCamperRepository) {
    const response = await camperRepository.getAll();
    return response.map((c) => new Camper(c));
    // const query = `
  }
  static async getById(id, camperRepository = defaultCamperRepository) {
    // get basic camper info
    const camperQuery = `SELECT 
     c.first_name,
     c.last_name ,
     c.gender,c.id,c.age,c.pronouns
     FROM campers c
     WHERE c.id = $1
    `;
    const camperValues = [id];
    const camperResponse = await pool.query(camperQuery, camperValues);
    if (camperResponse.rowCount === 0) {
      return false;
    }
    const {
      first_name: firstName,
      last_name: lastName,
      gender,
      age,
      id: camperId,
      pronouns,
    } = camperResponse.rows[0];

    // get camper weeks
    const camperWeekQuery = `
	  SELECT w.number,w.display, w.title, cw.id AS camper_week_id, cw.cabin_session_id AS cabin_session_id, cab.name AS cabin_name, cw.day_camp as day, cw.fl
		FROM camper_weeks cw
		LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
		LEFT JOIN cabins cab ON cs.cabin_name = cab.name
		LEFT JOIN weeks w ON cw.week_id = w.number
		WHERE cw.camper_id  = $1`;
    const camperWeekValues = [id];

    const camperWeekResponse = await pool.query(
      camperWeekQuery,
      camperWeekValues
    );

    const camperWeeks = camperWeekResponse.rows.reduce((acc, week) => {
      const currentWeekNumber = week.number;
      acc[currentWeekNumber] = {
        id: week.camper_week_id,
        title: week.title,
        camperWeekId: week.camper_week_id,
        display: week.display,
        weekNumber: week.number,
        cabinSessionId: week.cabin_session_id,
        cabin: week.cabin_name,
        day: week.day,
        fl: week.fl,
        schedule: {},
      };
      return acc;
    }, {});

    // get weekly schedule
    const camperScheduleQuery = `
		SELECT act.name, 
act.id as activity_id, 
actsess.id as activity_session_id,
p.id as period_id,
p.period_number as period_number,
d.name as day_name,
		  w.number as week_number
FROM camper_activities ca
JOIN camper_weeks cw ON cw.id = ca.camper_week_id
JOIN campers c ON c.id = cw.camper_id
JOIN activity_sessions actsess ON actsess.id = ca.activity_id
JOIN activities act ON act.id = actsess.activity_id
JOIN periods p ON p.id = actsess.period_id
JOIN days d ON d.id = p.day_id
	  JOIN weeks w ON w.number = d.week_id
WHERE c.id = $1
	  ORDER BY d.id, p.id
		`;
    const camperScheduleValues = [id];
    const camperScheduleResponse = await pool.query(
      camperScheduleQuery,
      camperScheduleValues
    );
    camperScheduleResponse.rows.forEach((act) => {
      const weekNumber = act.week_number;
      const dayName = act.day_name;
      const periodNumber = act.period_number;
      camperWeeks[weekNumber] = {
        ...camperWeeks[weekNumber],
        schedule: {
          ...camperWeeks[weekNumber].schedule,
          [dayName]: {
            ...camperWeeks[weekNumber].schedule[dayName],
            [periodNumber]: {
              id: act.period_id,
              activitySessionId: act.activity_session_id,
              activity: act.name,
              activityId: act.activity_id
            },
          },
        },
      };
    });
    // change weeks into array and sort for compatibility (is this nesc?)
    const weeks = Object.keys(camperWeeks);
    weeks.sort();
    const camperWeekArray = weeks.map((wn) => ({
      number: wn,
      ...camperWeeks[wn],
    }));
    // get camperComments
    const commentQuery =
      "SELECT * from camper_comments cc  JOIN users u on u.username = cc.username WHERE cc.camper_id = $1 ORDER BY date DESC";
    const commentValues = [id];
    const commentResponse = await pool.query(commentQuery, commentValues);
    const comments = commentResponse.rows.map((c) => ({
      id:c.id,
      username: c.username,
      firstName: c.first_name,
      lastName: c.last_name,
      date: c.date,
      content: c.content,
    }));
    //aggregate all data
    const camper = new Camper({
      firstName,
      lastName,
      age,
      pronouns,
      gender,
      id: camperId,
      weeks: camperWeekArray,
      comments,
    });

    return camper;  
  }
  async setPronouns(pronouns) {
    const query = "UPDATE campers SET pronouns = $1 WHERE id = $2";
    const values = [pronouns, this.id];
    try {
      await pool.query(query, values);
      this.pronouns = pronouns;
      return this;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = Camper;
