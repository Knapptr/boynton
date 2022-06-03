const result = require("dotenv").config({ path: "../../.env" });
const pool = require("../../db/index");
const parseSchedule = require("./parse");

const getPeriodId = async (weekNumber, dayName, periodNumber) => {
	const query = `
select p.id from periods p
JOIN days d on p.day_id = d.id
WHERE d.week_id = $1 AND d.name=$2 AND p.period_number = $3
	`;
	const values = [weekNumber, dayName, periodNumber];
	const results = await pool.query(query, values);
	const periodId = results.rows[0].id;
	return periodId;
};

const insertActivity = async (activityName, activityDescription, periodId) => {
	const query = `INSERT INTO activities (name,description,period_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT no_duplicates DO UPDATE set name=$1, description=$2`;
	const values = [activityName, activityDescription, periodId];
	const result = await pool.query(query, values);
	return result.rows;
};

const getPeriodIdAndInsert = async ({
	weekNumber,
	activity,
	description,
	period,
	day,
}) => {
	const periodId = await getPeriodId(weekNumber, day, period);
	const results = await insertActivity(activity, description, periodId);
	return results;
};

const insertActivities = async (schedule) => {
	await Promise.all(
		schedule.map((option) => {
			console.log(
				`Inserting ${option.day}-${option.period}:${option.activity}`
			);
			return getPeriodIdAndInsert(option);
		})
	);
};

parseSchedule(1).then((s) => insertActivities(s));
