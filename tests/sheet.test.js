const { GoogleSpreadsheet, mockAddRows } = require("google-spreadsheet");
const { addAwards, getAwards } = require("../sheets");
const { getTodayFormatted } = require("../utils/getDates");
jest.mock("google-spreadsheet");

test("adds 1 award to current week", async () => {
	const expectedList = [
		{
			awardFor: "Noodle Races",
			programArea: "challenge",
			first: "Tyler",
			last: "Knapp",
			date: getTodayFormatted(),
			commandEntry: "",
		},
	];
	await addAwards([
		{
			awardFor: "Noodle Races",
			programArea: "challenge",
			first: "Tyler",
			last: "Knapp",
		},
	]);
	expect(mockAddRows).toHaveBeenCalledWith(expectedList);
});
test("adds 2 award to current week", async () => {
	const providedList = [
		{
			awardFor: "Noodle Races",
			programArea: "challenge",
			first: "Anja",
			last: "Golden",
		},
		{
			awardFor: "Noodle Races",
			programArea: "challenge",
			first: "Tyler",
			last: "Knapp",
		},
	];
	const expectedList = providedList.map((entry) => {
		return { ...entry, date: getTodayFormatted(), commandEntry: "" };
	});
	await addAwards(providedList);
	expect(mockAddRows).toHaveBeenCalledWith(expectedList);
});
test("returns awards from current week", async () => {
	const fetchedAwards = await getAwards();
	const expectedAwards = {
		arts: [
			{
				awardFor: "Yarn Bombing",
				first: "Lilly",
				last: "Rushe",
				date: getTodayFormatted(),
				commandEntry: "",
			},
		],
		challenge: [
			{
				awardFor: "Archery",
				first: "Tyler",
				last: "Knapp",
				date: getTodayFormatted(),
				commandEntry: "",
			},
		],
	};
	expect(fetchedAwards).toEqual(expectedAwards);
});
