const { GoogleSpreadsheet, mockAddRows } = require("google-spreadsheet");
const { addAwards, getAwards } = require("../sheets");

jest.mock("google-spreadsheet");

test("adds 1 award to week 1", async () => {
	const providedList = [
		{
			for: "Noodle Races",
			programArea: "challenge",
			first: "Tyler",
			last: "Knapp",
		},
	];
	await addAwards(1, [
		{
			for: "Noodle Races",
			programArea: "challenge",
			first: "Tyler",
			last: "Knapp",
		},
	]);
	expect(mockAddRows).toHaveBeenCalledWith(providedList);
});
test("adds 2 award to week 1", async () => {
	const providedList = [
		{
			for: "Noodle Races",
			programArea: "challenge",
			first: "Anja",
			last: "Golden",
		},
		{
			for: "Noodle Races",
			programArea: "challenge",
			first: "Tyler",
			last: "Knapp",
		},
	];
	await addAwards(1, providedList);
	expect(mockAddRows).toHaveBeenCalledWith(providedList);
});
test("returns awards from mock sheet week 1", async () => {
	const fetchedAwards = await getAwards(1);
	const expectedAwards = {
		arts: [{ for: "Yarn Bombing", first: "Lilly", last: "Rushe" }],
		challenge: [{ for: "Archery", first: "Tyler", last: "Knapp" }],
	};
	expect(fetchedAwards).toEqual(expectedAwards);
});
