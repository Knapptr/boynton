////////
//[
// {weekNumber: 1,period:1,activity:"Archery",description:"shoot a bow",day:"Mon"}
//]
////////
const _ = require("lodash");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { formatmmddyyyy, getWeek, getYear } = require("../../utils/getDates");
const sheetID = process.env.ACTIVITY_SHEET_ID;

const loginCredentials = {
	client_email: process.env.SERVICE_ACCOUNT_EMAIL,
	private_key: process.env.GOOGLE_PRIVATE_KEY,
};

const parseSchedule = async (weekNumber = getWeek()) => {
	const doc = new GoogleSpreadsheet(sheetID);
	await doc.useServiceAccountAuth(loginCredentials);
	await doc.loadInfo();
	const sheet = doc.sheetsByTitle[`Week ${weekNumber}`];
	const rows = await sheet.getRows();
	const optionsAndDescriptions = sheet.headerValues.slice(2);
	const activities = rows.reduce((acc, cv) => {
		const options = [];
		for (let i = 0; i < optionsAndDescriptions.length; i += 2) {
			const activityHeader = optionsAndDescriptions[i];
			const descriptionHeader = optionsAndDescriptions[i + 1];
			if (cv[activityHeader]) {
				options.push({
					weekNumber,
					day: cv["Day"],
					period: cv["Period"],
					activity: cv[activityHeader],
					description: cv[descriptionHeader],
				});
			}
		}
		acc = [...acc, ...options];
		return acc;
	}, []);
	return activities;
};

//This was nice, but made the schedule more human readable...not for db insertion...

// const parseSchedule = async (week = getWeek()) => {
// 	const doc = new GoogleSpreadsheet(sheetID);
// 	await doc.useServiceAccountAuth(loginCredentials);
// 	await doc.loadInfo();
// 	const sheet = doc.sheetsByTitle[`Week ${week}`];
// 	const rows = await sheet.getRows();
// 	const optionsAndDescriptions = sheet.headerValues.slice(2);
// 	const schedule = rows.reduce(
// 		(acc, cv) => {
// 			const currentDay = cv["Day"];
// 			acc.days = _.uniq([...acc.days, currentDay]);
// 			const currentPeriod = cv["Period"];
// 			acc[currentDay] = acc[currentDay] || { periods: [] };
// 			acc[currentDay].periods = _.uniq([
// 				...acc[currentDay].periods,
// 				currentPeriod,
// 			]);
// 			acc[currentDay][currentPeriod] =
// 				acc[currentDay][currentPeriod] || [];
// 			for (let i = 0; i < optionsAndDescriptions.length; i += 2) {
// 				const activity = cv[optionsAndDescriptions[i]];
// 				const description = cv[optionsAndDescriptions[i + 1]];
// 				if (activity) {
// 					acc[currentDay][currentPeriod].push({
// 						activity,
// 						description: description || null,
// 					});
// 				}
// 			}
// 			return acc;
// 		},
// 		{ days: [] }
// 	);
// 	schedule.weekNumber = week;
// 	return schedule;
// };

module.exports = parseSchedule;
