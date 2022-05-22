const { createDocsPPT, createDocsPDF } = require("../createDocs");
const fs = require("fs/promises");
const config = require("../config.json");
const PizZip = require("pizzip");
const Templater = require("docxtemplater");
const pdfFillForm = require("pdf-fill-form");

jest.mock("docxtemplater");
jest.mock("pizzip");
jest.mock("pdf-fill-form");
afterEach(() => {
	jest.clearAllMocks();
});
jest.spyOn(fs, "writeFile").mockImplementation();
jest.spyOn(fs, "readFile").mockImplementation();

describe("file creation", () => {
	test("creates two arts awards for yarn bombing", async () => {
		const data = {
			awardType: "arts",
			awards: [
				{ for: "Yarn Bombing", first: "Anja", last: "Golden" },
				{ for: "Noodle Art", first: "Tyler", last: "Knapp" },
			],
		};
		await createDocsPPT(data.awardType, data.awards, config.templatePaths);
		expect(fs.writeFile).toHaveBeenCalledTimes(2);
	});
	test("creates one arts awards for yarn bombing", async () => {
		const data = {
			awardType: "arts",
			awards: [{ for: "Yarn Bombing", first: "Anja", last: "Golden" }],
		};
		await createDocsPPT(data.awardType, data.awards, config.templatePaths);
		expect(fs.writeFile).toHaveBeenCalledTimes(1);
	});
	test("throws error for nonexistant template", async () => {
		const data = {
			awardType: "judo",
			awards: [{ for: "Judo", first: "Anja", last: "Golden" }],
		};
		await expect(
			createDocsPPT(data.awardType, data.awards, config.templatePaths)
		).rejects.toThrow("no template provided");
	});
	test("gets waterfront from wf", async () => {
		const data = {
			awardType: "waterfront",
			awards: [{ for: "Noodle Races", first: "Jimbo", last: "Slice" }],
		};
		await createDocsPPT(data.awardType, data.awards, config.templatePaths);
		expect(fs.writeFile).toHaveBeenCalledTimes(1);
	});
});
describe("Tests PDF", () => {
	test("creates two arts awards for yarn bombing", async () => {
		const data = {
			awardType: "arts",
			awards: [
				{ for: "Yarn Bombing", first: "Anja", last: "Golden" },
				{ for: "Noodle Art", first: "Tyler", last: "Knapp" },
			],
		};
		await createDocsPDF(data.awardType, data.awards, config.templatePaths);
		expect(fs.writeFile).toHaveBeenCalledTimes(2);
	});
	test("throws error for nonexistant template", async () => {
		const data = {
			awardType: "judo",
			awards: [{ for: "Judo", first: "Anja", last: "Golden" }],
		};
		await expect(
			createDocsPDF(data.awardType, data.awards, config.templatePaths)
		).rejects.toThrow("no template provided");
	});
});
