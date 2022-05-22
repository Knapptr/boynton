const Day = require("../models/day");

test("Creates day", () => {
	const expectedDay = {
		name: "MON",
		weekID: 1,
		id: 1,
	};
	const day = new Day(expectedDay);
	expect(day.name).toBe("MON");
	expect(day.weekID).toBe(1);
	expect(day.id).toBe(1);
});

test("Throws error if day name not 3 characters", () => {
	const invalidDay = {
		name: " MONDAY",
		weekID: 1,
		id: 1,
	};
	expect(() => {
		new Day(invalidDay);
	}).toThrow();
});
