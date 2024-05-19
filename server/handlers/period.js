const { param, body } = require("express-validator");
const Period = require("../../models/period");
const handleValidation = require("../../validation/validationMiddleware");
const StaffSession = require("../../models/staffSession");

module.exports = {
	async getAll(req, res, next) {
		let { day } = req.query;
		let periods = await Period.getAll();
		if (day) {
			day = Number.parseInt(day);
			periods = periods.filter((period) => period.dayID === day);
		}
		res.json(periods);
	},
	getActivities: [
		param("periodId").exists().isInt().custom(async (periodId, { req }) => {
			console.log("validating period");
			const period = await Period.get(periodId);
			if (!period) {
				throw new Error("Period does not exist");
			}
			req.period = period
		}),
		handleValidation
		, async (req, res, next) => {
			const period = req.period;
			let activities = await period.getActivities();
			res.json(activities);
		}],
	getOne: [
		param("periodId").exists().isInt().custom(async (periodId, { req }) => {
			console.log("validating period");
			const period = await Period.get(periodId);
			if (!period) {
				throw new Error("Period does not exist");
			}
			req.period = period
		}),
		handleValidation,
		async (req, res, next) => {
			const period = req.period
			res.json(period);
		}],
	getCampers: [
		param("periodId").exists().isInt().custom(async (periodId, { req }) => {
			console.log("validating period");
			const period = await Period.get(periodId);
			if (!period) {
				throw new Error("Period does not exist");
			}
			req.period = period
		}),
		handleValidation,
		async (req, res, next) => {
			const { cabin, assigned } = req.query;
			const period = req.period
			let campers = await period.getCampers();
			if (cabin) {
				campers = campers.filter((c) => c.cabin === cabin);
			}
			if (assigned) {
				if (assigned === "true") {
					campers = campers.filter((c) => c.activityID !== null);
				} else {
					campers = campers.filter((c) => c.activityID === null);
				}
			}
			res.json(campers);
		}],
	deleteStaff:[
		//validate that the period exists, and place it on the request object
		param("periodId").isInt().custom(async(id,{req})=>{
			const period = await Period.get(id);
			console.log({period});
			if(!period){throw new Error("Period not found")}
			req.period=period;
		}),
		
		// validate that there is a staff list, and set up an empty array on the request for holding retrieved staffSessions
		body("staffList").isArray({min:1}).withMessage("arrlen"),
		(req,res,next)=>{req.staffList = []; next()},
		body("staffList.*.id").exists().withMessage("idnotinarr").isInt().withMessage("not int").custom(async(sid,{req})=>{
			//validate staffSessionIds and add to request array
			const staffSession = await StaffSession.get(sid);
			if(!staffSession){throw new Error(`Staff session with id ${sid} not found`)};
			req.staffList.push(staffSession);
		}).withMessage("custom failure"),
		// delete the staff
		async (req,res) =>{
			const {period,staffList} = req;
			try{
			const results = await period.removeStaffOn(staffList);
			res.json(results);
			}catch(e){
				res.status(404);
				res.send(e.message);
			}
		}

	],
	assignStaff: [
		//validate that the period exists, and place it on the request object
		param("periodId").isInt().custom(async(id,{req})=>{
			const period = await Period.get(id);
			console.log({period});
			if(!period){throw new Error("Period not found")}
			req.period=period;
		}),
		
		// validate that there is a staff list, and set up an empty array on the request for holding retrieved staffSessions
		body("staffList").isArray({min:1}).withMessage("arrlen"),
		(req,res,next)=>{req.staffList = []; next()},
		body("staffList.*.id").exists().withMessage("idnotinarr").isInt().withMessage("not int").custom(async(sid,{req})=>{
			//validate staffSessionIds and add to request array
			const staffSession = await StaffSession.get(sid);
			if(!staffSession){throw new Error(`Staff session with id ${sid} not found`)};
			req.staffList.push(staffSession);
		}).withMessage("custom failure"),
		handleValidation,
		// assign the staff
		async (req,res) =>{
			console.log({sl:req.staffList})
			const {period,staffList} = req;
			try{
			const results = await period.assignStaffOn(staffList);
			res.json(results);
			}catch(e){
				res.status(404);
				res.send(e.message);
			}
		}
	]
};
