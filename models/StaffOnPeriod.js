const pool = require("../db");

module.exports = class StaffOnPeriod {
  constructor({ id, activitySessionId, staffSessionId, periodId }) {
    (this.id = id),
      (this.activitySessionId = activitySessionId || null),
      (this.staffSessionId = staffSessionId),
      (this.period_id = periodId);
  }
  static async getSome(ids) {
    const query = `SELECT * FROM staff_on_periods WHERE id = ANY ($1)`;
    const values = [ids];
    const results = await pool.query(query,values);
    return results.rows.map((sop) => {
      return new StaffOnPeriod({
        id: sop.id,
        activitySessionId: sop.activity_session_id,
        staffSessionId: sop.staff_session_id,
        periodId: sop.period_id,
      });
    });
  }
};
