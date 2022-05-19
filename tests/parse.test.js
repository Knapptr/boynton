const parse = require("../parse");
describe("Errors", () => {
	test("error if no :", () => {
		const arg = "arts yarn bombing tyler knapp";
		expect(() => parse(arg)).toThrow(
			"arguments and list must be separated by a colon (:)"
		);
	});
});
describe("awardType field", () => {
	test("Gets arts from arts", () => {
		const arg = "arts Yarn-Bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).programArea).toBe("arts");
	});

	test("handles 'Arts'", () => {
		const arg = "Arts Yarn-Bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).programArea).toBe("arts");
	});

	test("handles 'Creative'", () => {
		const arg = "Creative Yarn-Bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).programArea).toBe("arts");
	});

	test("handles 'Crea'", () => {
		const arg = "Crea Yarn-Bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).programArea).toBe("arts");
	});
	test("Gets waterfront from wf", () => {
		const arg = "wf Yarn-Bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).programArea).toBe("waterfront");
	});

	test("handles non existant argument", () => {
		const arg = "Foo Yarn-Bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).programArea).toBe(null);
	});
});

describe("awardFor field", () => {
	test("gets Yarn-Bombing from yarn-bombing", () => {
		const arg = "Arts yarn-bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).awardFor).toBe("Yarn Bombing");
	});

	test("gets Yarn-Bombing from YARN-BOMBING", () => {
		const arg = "Arts YARN-BOMBING: Tyler Knapp Anja Golden";
		expect(parse(arg).awardFor).toBe("Yarn Bombing");
	});

	test("gets Yarn-Bombing from yarn_bombing", () => {
		const arg = "Arts yarn_bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).awardFor).toBe("Yarn Bombing");
	});
	test("gets Yarn Bombing from yarn bombing", () => {
		const arg = "Arts yarn bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).awardFor).toBe("Yarn Bombing");
	});
	test("gets type from no argument", () => {
		const arg = "Arts: Tyler Knapp Anja Golden";
		expect(parse(arg).awardFor).toBe("Arts");
	});
	test("gets dodgeball  from no awardType", () => {
		const arg = "dodgeball: Tyler Knapp Anja Golden";
		expect(parse(arg).awardFor).toBe("Dodgeball");
	});
});

describe("list", () => {
	test("throws error if uneven number of names (must have first and last)", () => {
		const arg = "arts yarn bombing: Tyler Knapp Anja";
		expect(() => parse(arg)).toThrow(
			"List must include first and last names."
		);
	});
	test("returns name list, 1 set", () => {
		const arg = "arts yarn bombing: Tyler Knapp";
		expect(parse(arg).names).toEqual([{ first: "Tyler", last: "Knapp" }]);
	});
	test("capitalizes names", () => {
		const arg = "arts yarn bombing: tyler knapp";
		expect(parse(arg).names).toEqual([{ first: "Tyler", last: "Knapp" }]);
	});
	test("returns name list, 2 set", () => {
		const arg = "arts yarn bombing: Tyler Knapp Anja Golden";
		expect(parse(arg).names).toEqual([
			{ first: "Tyler", last: "Knapp" },
			{ first: "Anja", last: "Golden" },
		]);
	});
});
