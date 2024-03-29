const programAreas = [
	{ name: "Challenge Activities" },
	{ name: "Waterfront" },
	{ name: "Creative Arts" },
	{ name: "Archery" },
	{ name: "Ropes" },
	{ name: "Superstar" },
	{ name: "Polar Bear Dip" },
	{ name: "Clean Cabin" }
]

const standardDays = [
	{ name: "MON", periods: 4 },
	{ name: "TUE", periods: 4 },
	{ name: "WED", periods: 4 },
	{ name: "THU", periods: 4 },
	{ name: "FRI", periods: 2 }

]
const tasteDays = [
	{ name: "WED", periods: 4 },
	{ name: "THU", periods: 4 },
	{ name: "FRI", periods: 2 }

]
const mapWeek = (number, begins, ends, title, days, display) => {
	return {
		number,
		begins,
		ends,
		title,
		days: days || standardDays,
		display: display || `${number}`
	}
}
const weeks = [
	mapWeek(1, "2023-07-05", "2023-07-07", "Taste of Camp", tasteDays, "T"),
	mapWeek(2, "2023-07-09", "2023-07-15", "Under The Sea Week", standardDays, "1"),
	mapWeek(3, "2023-07-16", "2023-07-21", "Time Travel Week", standardDays, "2"),
	mapWeek(4, "2023-07-23", "2023-07-28", "Fantasy Week", standardDays, "3"),
	mapWeek(5, "2023-07-30", "2023-08-04", "Holiday Week", standardDays, "4"),
	mapWeek(6, "2023-08-06", "2023-08-11", "Hollywood Week", standardDays, "5"),
	mapWeek(7, "2023-08-13", "2023-08-18", "Fantastic Finale", standardDays, "6"),
]

const mapCabin = (name, capacity, area) => ({
	name,
	capacity,
	area
})

const cabins = [
	mapCabin("8", 6, "BA"),
	mapCabin("9", 6, "BA"),
	mapCabin("bears", 4, "BA"),
	mapCabin("11", 10, "BA"),
	mapCabin("12", 10, "BA"),
	mapCabin("1", 4, "GA"),
	mapCabin("2", 6, "GA"),
	mapCabin("3", 4, "GA"),
	mapCabin("4", 4, "GA"),
	mapCabin("5", 4, "GA"),
	mapCabin("6", 4, "GA"),
	mapCabin("7", 4, "GA"),
	mapCabin("owls", 4, "GA"),
	mapCabin("eagles", 10, "GA"),
	mapCabin("13", 12, "GA")
]

const createUser = ({ username, password, firstName, lastName, role = "counselor" }) => ({
	username, password, firstName, lastName, role
})
const users = [
	{ username: "admin", password: "password", firstName: "default", lastName: "account", role: "admin" },
	{ username: "BBitchell", password: "password", firstName: "Beira", lastName: "Bitchell", role: "counselor" },
	{ username: "BBushe", password: "password", firstName: "Billy", lastName: "Bushe", role: "counselor" },
	{ username: "BBigel", password: "password", firstName: "Blyna", lastName: "Bigel", role: "counselor" },
	{ username: "BBegrappo", password: "password", firstName: "Biffin", lastName: "Begrappo", role: "counselor" },
	{ username: "BBogart", password: "password", firstName: "Bash", lastName: "Bogart", role: "counselor" },
	{ username: "BBolden", password: "password", firstName: "Banja", lastName: "Bolden", role: "counselor" },
	{ username: "BBuletza", password: "password", firstName: "Baniel", lastName: "Buletza", role: "counselor" }
];

const config = {
	users,
	weeks,
	cabins,
	programAreas
}

module.exports = config;

