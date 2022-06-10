// /api/activities

const camperWeek = {
	id: 44,
	firstName: "Tyler",
	lastName: "Knapp",
	age: 12,
	gender: "Male",
	weekNumber: 1,
	weekTitle: "Around the World Week",
	camperID: 103,
	cabinSessionID: 3 || null,
	cabinName: "bears" || "unassigned",
	activities: [
		{
			camperActivityID: 12,
			activityID: 3,
			periodID: 4,
			activityName: "Archery",
			activityDescription: "Shooting a bow!",
		},
	],
};
const camper = {
	firstName: "Tyler",
	lastName: "Knapp",
	gender: "Male",
	id: 103,
	age: 12,
	weeks: [
		{
			weekNumber: 3,
			weekTitle: "Holiday Week",
			camperWeekID: 10241,
			cabinSessionID: 22,
			cabinName: "8",
		},
	],
};
const activity = {
	name: "activityName",
	id: 1221,
	periodID: 12,
	description: "What is this activity?",
	campers: [
		{
			sessionID: 12,
			camperID: 32,
			firstName: "Tyler",
			lastName: "Knapp",
		},
		{
			sessionID: 23,
			camperID: 12,
			firstName: "Elizabeth",
			lastName: "Golden",
		},
	],
};

// /api/periods
const period = {
	dayID: 5,
	number: 2,
	id: 122,
	activities: [
		{ name: "boating", description: "I'm on a boat!", activityID: 12 },
	],
};

// /api/weeks
const week = {
	title: "The Week from Outer Space",
	number: 2,
	days: [
		{
			name: "MON",
			id: 2,
			periods: [
				{
					periodNumber: 1,
					id: 68,
				},
				{
					periodNumber: 2,
					id: 69,
				},
			],
		},
		{
			name: "TUE",
			id: 4,
			periods: [
				{
					periodNumber: 1,
					id: 62,
				},
				{
					periodNumber: 2,
					id: 100,
				},
			],
		},
	],
};
