const { getYear, getWeek, getTodayFormatted } = require("../utils/getDates");

const mockAddRows = jest.fn();

const mockRows = [
	{
		awardFor: "Archery",
		programArea: "challenge",
		first: "Tyler",
		last: "Knapp",
		date: getTodayFormatted(),
		commandEntry: "",
	},
	{
		awardFor: "Yarn Bombing",
		programArea: "arts",
		first: "Lilly",
		last: "Rushe",
		date: getTodayFormatted(),
		commandEntry: "",
	},
];

const mockGetRows = jest.fn().mockImplementation(() => mockRows);
const mock = jest.fn().mockImplementation(() => {
	return {
		useServiceAccountAuth: jest.fn(),
		loadInfo: jest.fn(),
		sheetsByTitle: {
			[`${getYear()}-${getWeek()}`]: {
				getRows: mockGetRows,
				addRows: mockAddRows,
			},
		},
	};
});
module.exports = { GoogleSpreadsheet: mock, mockAddRows };
