const { body, param } = require("express-validator");
const Activity = require("../models/activity");
const ActivitySession = require("../models/activitySession");
const Period = require("../models/period");
const StaffSession = require("../models/staffSession");
const ApiError = require("../utils/apiError");
const DbError = require("../utils/DbError");
const pool = require("../db");

const activitySessionValidator = {
  validateExistingActivityId: () =>
    body("activityId")
      .exists()
      .isInt()
      .custom(async (activityId, { req }) => {
        // make sure that activity exists
        const activity = await Activity.get(activityId);
        if (!activity) {
          throw ApiError.notFound("Activity does not exist");
        }
        // make sure that activity session for activity on this period isn't already scheduled
        if (activity.sessions.some((s) => s.periodId === req.body.periodId)) {
          throw ApiError.badRequest(
            "Activity session already scheduled for period"
          );
        }
      }),
  validatePeriodId: () =>
    body("periodId")
      .exists()
      .isInt()
      .custom(async (periodId) => {
        const period = await Period.get(periodId);
        if (!period) {
          throw ApiError.notFound("Period does not exist");
        }
      }),
  validateActivitySessionExists: () =>
    param("activitySessionId")
      .exists()
      .isInt()
      .custom(async (activitySessionId, { req }) => {
        const activitySession = await ActivitySession.get(activitySessionId);
	      console.log({activitySession});
        if (!activitySession) {
          throw ApiError.notFound("activity session does not exist");
        }
        //set activity session on request
        req.activitySession = activitySession;
      }),

  /** Check that all staff members are valid */
  validateStaffMembers: () =>
    body("staff")
      .exists()
      .isArray()
      .custom(async (staff) => {
        const staffSessionIdList = staff.map((s) => s.staffSessionId);
        const staffers = await StaffSession.getSome(staffSessionIdList);
        if (staffers.length === 0) {
          throw DbError.notFound("Staff member doesnt exist");
        }
      }),
  validateCampers: () =>
    body("campers")
      .exists()
      .isArray()
      .custom(async (campers) => {
        const client = await pool.connect();
        const camperResults = [];
        try {
          await client.query("BEGIN");
          const reqs = campers.map(async (c) => {
            const query = "SELECT id FROM camper_weeks cw WHERE cw.id = $1";
            const values = [c.sessionId];
            const response = await client.query(query, values);
	  console.log({response:response.rows});
            const data = response.rows.map((r) => r.id);
            camperResults.push(...data);
            return data;
          });
          await Promise.all(reqs);
          await client.query("COMMIT");
        } catch (e) {
          client.query("ROLLBACK");
          throw DbError.transactionFailure("Transaction Failed: " + e);
        } finally {
          client.release();
          console.log({ camperResults });
          if (camperResults.length !== campers.length) {
            throw DbError.notFound("Invalid camper session id");
          }
        }
      }),
};

module.exports = activitySessionValidator;
