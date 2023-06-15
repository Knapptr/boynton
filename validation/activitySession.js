const { body, param } = require("express-validator");
const Activity = require("../models/activity");
const ActivitySession = require("../models/activitySession");
const Period = require("../models/period");
const StaffSession = require("../models/staffSession");
const ApiError = require("../utils/apiError");
const DbError = require("../utils/DbError");


const activitySessionValidator = {
	validateExistingActivityId: () => body("activityId").exists().isInt().custom(async (activityId, { req }) => {
		// make sure that activity exists
		const activity = await Activity.get(activityId);
		if (!activity) {
			throw ApiError.notFound("Activity does not exist");
		}
		// make sure that activity session for activity on this period isn't already scheduled
		if (activity.sessions.some(s => s.periodId === req.body.periodId)) {
			throw ApiError.badRequest("Activity session already scheduled for period")
		}
	}),
	validatePeriodId: () => body("periodId").exists().isInt().custom(async (periodId) => {
		const period = await Period.get(periodId);
		if (!period) {
			throw ApiError.notFound("Period does not exist");
		}

	}),
	validateActivitySessionExists: () => param("activitySessionId").exists().isInt().custom(async (activitySessionId, { req }) => {
		const activitySession = await ActivitySession.get(activitySessionId);
		if (!activitySession) {
			throw ApiError.notFound("activity session does not exist");
		}
		//set activity session on request
		req.activitySession = activitySession;
	}),

	/** Check that all staff members are valid */
	validateStaffMembers: () => body("staff").exists().isArray().custom(async (staff) => {
		const staffSessionIdList = staff.map(s => s.staffSessionId)
		const staffers = await StaffSession.getSome(staffSessionIdList);
		if (staffers.length === 0) {
			throw DbError.notFound("Staff member doesnt exist");
		}
	})

}


module.exports = activitySessionValidator;
