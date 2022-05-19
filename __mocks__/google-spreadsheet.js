const mockAddRows = jest.fn();

const mockRows = [
	{ for: "Archery", programArea: "challenge", first: "Tyler", last: "Knapp" },
	{ for: "Yarn Bombing", programArea: "arts", first: "Lilly", last: "Rushe" },
];

const mockGetRows = jest.fn().mockImplementation(() => mockRows);
const mock = jest.fn().mockImplementation(() => {
	return {
		useServiceAccountAuth: jest.fn(),
		loadInfo: jest.fn(),
		sheetsByTitle: {
			"2022-1": {
				getRows: mockGetRows,
				addRows: mockAddRows,
			},
		},
	};
});
module.exports = { GoogleSpreadsheet: mock, mockAddRows };
