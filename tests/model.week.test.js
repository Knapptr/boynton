const Week = require("../models/week");

test("construction", () => {
	const week = new Week({ title: "Holiday Week", number: 1 });
	expect(week.title).toBe("Holiday Week");
	expect(week.number).toBe(1);
});
