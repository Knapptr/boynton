const Period = require("../models/period");

test("Creates period", () => {
	const expectedPeriod = {
		periodNumber: 1,
		dayID: 1,
		id: 1,
	};

	const period = new Period(expectedPeriod);

	expect(period.periodNumber).toBe(1);
	expect(period.id).toBe(1);
	expect(period.dayID).toBe(1);
});
