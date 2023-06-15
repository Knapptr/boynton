const toTitleCase = (string) => {
	const words = string.split(" ");
	// const titled = [];
	const lowerCased = words.map((w) => {
		const end = w.slice(1).toLowerCase();
		return w[0].toUpperCase() + end;
	});
	return lowerCased.join(" ");
};

export default toTitleCase;
