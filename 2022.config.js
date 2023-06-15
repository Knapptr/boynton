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
const weeks = [

	{
		number: 1,
		begins: "2022-07-10",
		ends: "2022-07-15",
		title: "Around The World Week",
		days: standardDays
	},
	{
		number: 2,
		begins: "2022-07-17",
		ends: "2022-07-22",
		title: "The Week from Outer Space!",
		days: standardDays
	},
	{
		number: 3,
		begins: "2022-07-24",
		ends: "2022-07-29",
		title: "Holiday Week",
		days: standardDays
	},
	{
		number: 4,
		begins: "2022-07-31",
		ends: "2022-08-05",
		title: "Time Travel Week",
		days: standardDays
	},
	{
		number: 5,
		begins: "2022-08-07",
		ends: "2022-08-15",
		title: "Color War Week",
		days: standardDays
	},
	{
		number: 6,
		begins: "2022-08-17",
		ends: "2022-08-22",
		title: "Fantastic Finale Week",
		days: standardDays
	}
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

