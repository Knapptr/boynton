const _ = require("lodash");
const config = require("./config.json");

const getAreaFromList = (areaTerm) => {
	return _.findKey(config.programAreas, (a) => {
		return a.includes(areaTerm);
	});
};

const isOdd = (number) => {
	return number % 2 == 0 ? false : true;
};

const titleCase = (string) => {
	return _.startCase(_.camelCase(string));
};

const parse = (argumentString) => {
	if (!argumentString.includes(":")) {
		throw new Error("arguments and list must be separated by a colon (:)");
	}
	// parse strings
	const argsAndList = argumentString.split(":");
	const args = argsAndList[0].split(" ");
	const list = argsAndList[1].trim().split(" ");
	//award type
	const awardTypeArgument = args[0].toLowerCase();
	const programArea = getAreaFromList(awardTypeArgument) || null;

	let awardFor;
	//handle not enough args before :, or area argument is null
	if (programArea === null || args.length <= 1) {
		awardFor = titleCase(args.join(""));
	} else {
		awardFor = titleCase(args.slice(1).join(" "));
	}

	//list
	if (isOdd(list.length)) {
		throw new Error("List must include first and last names.");
	}
	const chunkedList = _.chunk(list, 2);

	const names = [];

	chunkedList.forEach((name) => {
		names.push({
			first: _.capitalize(name[0]),
			last: _.capitalize(name[1]),
			awardFor,
		});
	});

	return { programArea, names };
};

module.exports = parse;
