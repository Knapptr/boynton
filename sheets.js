const { GoogleSpreadsheet } = require("google-spreadsheet");
const { weeks } = require("./config.json");

const sheetID = "16uE5u4bsjz798eLWDVoh0n8JHjSsmecnZneFCcH8F5E";

const loginCredentials = {
	client_email: process.env.SERVICE_ACCOUNT_EMAIL,
	private_key: process.env.GOOGLE_PRIVATE_KEY,
};

const getWeek = (dateArg) => {
	const date = dateArg ? Date.parse(dateArg) : new Date();
	const keys = Object.keys(weeks);
	const week = keys.find((key) => {
		const start = Date.parse(weeks[key].start);
		const end = Date.parse(weeks[key].end);
		console.log({ start, end, date });
		if (date >= start && date <= end) {
			return true;
		} else {
			return false;
		}
	});
	return week || "non";
};
const getYear = () => {
	return new Date().getFullYear();
};

const formatmmddyyyy = (date) => {
	const mm = date.getMonth() + 1;
	const dd = date.getDate();
	const yyyy = date.getFullYear();
	return `${mm}/${dd}/${yyyy}`;
};
const addAwards = async (list) => {
	const doc = new GoogleSpreadsheet(sheetID);
	await doc.useServiceAccountAuth(loginCredentials);
	await doc.loadInfo();
	const sheet = doc.sheetsByTitle[`${getYear()}-${getWeek()}`];
	const awardList = [];
	list.forEach((award) => {
		awardList.push({
			awardFor: award.awardFor,
			programArea: award.programArea,
			first: award.first,
			last: award.last,
			commandEntry: award.commandEntry || "",
			date: formatmmddyyyy(new Date()),
		});
	});
	sheet.addRows(awardList);
};

const getAwards = async (week) => {
	const doc = new GoogleSpreadsheet(sheetID);
	await doc.useServiceAccountAuth(loginCredentials);
	await doc.loadInfo();
	const sheet = doc.sheetsByTitle[`${getYear()}-${week}`];
	const rows = await sheet.getRows();
	const awardData = {};
	rows.forEach((award) => {
		if (!awardData[award.programArea]) awardData[award.programArea] = [];
		awardData[award.programArea].push({
			first: award.first,
			last: award.last,
			awardFor: award.awardFor,
			commandEntry: award.commandEntry || "",
			date: award.date,
		});
	});
	return awardData;
};

module.exports = { addAwards, getAwards, getWeek, getYear };
