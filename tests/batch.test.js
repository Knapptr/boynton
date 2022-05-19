const createAwardBatch = require("../batch");
const batch = require("../batch");
const { createDocsPDF, createDocsPPT } = require("../createDocs");

jest.mock("../createDocs", () => {
	return {
		createDocsPDF: jest.fn(),
		createDocsPPT: jest.fn(),
	};
});

afterEach(() => {
	jest.clearAllMocks();
});

test("calls createDocs for each award in key ", () => {
	const mockData = {
		arts: [{ for: "Noodles", first: "Timmy", last: "McGillicutty" }],
	};
	createAwardBatch(mockData, "pdf");
	expect(createDocsPDF).toBeCalledTimes(1);
});
test("calls createDocs for each award in key ", () => {
	const mockData = {
		arts: [{ for: "Noodles", first: "Timmy", last: "McGillicutty" }],
		challenge: [{ for: "Jousting", first: "Timmy", last: "McGillicutty" }],
	};
	createAwardBatch(mockData, "pdf");
	expect(createDocsPDF).toBeCalledTimes(2);
});
test("only calls once per area", () => {
	const mockData = {
		arts: [
			{ for: "Bootles", first: "Timmy", last: "McGillicutty" },
			{ for: "Noodles", first: "Timmy", last: "McGillicutty" },
		],
		challenge: [{ for: "Jousting", first: "Timmy", last: "McGillicutty" }],
	};
	createAwardBatch(mockData, "pdf");
	expect(createDocsPDF).toBeCalledTimes(2);
});
test("throws error if not pdf or ppt", () => {
	const mockData = {
		arts: [
			{ for: "Bootles", first: "Timmy", last: "McGillicutty" },
			{ for: "Noodles", first: "Timmy", last: "McGillicutty" },
		],
		challenge: [{ for: "Jousting", first: "Timmy", last: "McGillicutty" }],
	};
	expect(createAwardBatch(mockData, "exe")).rejects.toThrow();
});
