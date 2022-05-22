const { weeks } = require("../config.json");
const getYear = () => {
	return new Date().getFullYear();
};

const getWeek = (dateArg) => {
	const date = dateArg ? Date.parse(dateArg) : new Date();
	const keys = Object.keys(weeks);
	const week = keys.find((key) => {
		const start = Date.parse(weeks[key].start);
		const end = Date.parse(weeks[key].end);
		if (date >= start && date <= end) {
			return true;
		} else {
			return false;
		}
	});
	return week || "non";
};
const formatmmddyyyy = (date) => {
	const mm = date.getMonth() + 1;
	const dd = date.getDate();
	const yyyy = date.getFullYear();
	return `${mm}/${dd}/${yyyy}`;
};

const getTodayFormatted = () => {
	return formatmmddyyyy(new Date());
};

module.exports = { getWeek, getYear, formatmmddyyyy, getTodayFormatted };
