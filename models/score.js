const pool = require("../db");
const defaultRepository = require("../repositories/score");
const getDayName = (dayNumber) => {
  return [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ][dayNumber]
}
class Score {
  constructor({ awardedTo, points, awardedFor, weekNumber, id }) {
    this.id = id;
    this.awardedTo = awardedTo;
    this.awardedFor = awardedFor;
    this.weekNumber = weekNumber;
    this.points = points;
  }

  static VALID_TEAMS = ["Tahattawan", "Naumkeag"];
  static async getAll(repository = defaultRepository) {
    const response = await repository.getAll();
    if (!response) {
      return [];
    }
    return response.map((r) => new Score(r));
  }
  static async create(props, repository = defaultRepository) {
    const response = await repository.create(props);
    return new Score(response);
  }

  static getForWeek = async (weekNumber) => {
    // begin transaction
    const client = await pool.connect();
    try {
      const values = [weekNumber];
      // get total for summer
      const summerQuery = "SELECT awarded_to, SUM(points) as total FROM scores GROUP BY awarded_to";
      const summerResp = client.query(summerQuery);

      const weekTotalQuery = "SELECT awarded_to, SUM(points) as total FROM scores  WHERE week_number = $1 GROUP BY awarded_to";
      const weekTotalResp = client.query(weekTotalQuery, values);

      const weekEventsQuery = "SELECT awarded_at, awarded_to, awarded_for, points FROM scores  WHERE week_number = $1";
      const weekEventsResp = client.query(weekEventsQuery, values);

      const [summerRes, weekTRes, weekLRes] = await Promise.all([summerResp, weekTotalResp, weekEventsResp]);
      await client.query("COMMIT");
      console.log({ summerRes });
      return {
        summerTotals: summerRes.rows.map(r => ({ team: r.awarded_to, total: r.total })),
        weekTotals: weekTRes.rows.map(r => ({ team: r.awarded_to, total: r.total })),
        events: weekLRes.rows.map(r => ({ team: r.awarded_to, points: r.points, for: r.awarded_for, day: getDayName(new Date(r.awarded_at).getDay()) }))
      }
    } catch (e) {
      client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}
module.exports = Score;
