const Activity = require("../models/activity");
test("Create an activity with constructor", () => {
	const activityToCreate = {
		name: "Testing",
		description: "Testing the activity model",
		id: 1,
		periodID: 1,
	};
	const activity = new Activity(activityToCreate);
	expect(activity.name).toBe(activityToCreate.name);
	expect(activity.description).toBe(activityToCreate.description);
	expect(activity.id).toBe(activityToCreate.id);
	expect(activity.periodID).toBe(activityToCreate.periodID);
});
