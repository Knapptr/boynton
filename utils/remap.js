module.exports = ({
	array,
	identifier,
	newField,
	fieldsToMap,
	fieldsToRemain,
}) => {
	const reduced = array.reduce((ac, cv) => {
		const toPush = {};
		const arrayToPushInto = [];
		const outsideArray = {};
		for (let field of fieldsToRemain) {
			outsideArray[field] = cv[field];
		}
		for (let field of fieldsToMap) {
			if (cv[field]) {
				toPush[field] = cv[field];
			}
		}
		if (Object.keys(toPush).length > 0) {
			arrayToPushInto.push(toPush);
		}
		outsideArray[newField] = arrayToPushInto;

		const element = ac.find((p) => p[identifier] === cv[identifier]);
		if (element) {
			element[newField] = [...element[newField], ...arrayToPushInto];
			return ac;
		}
		ac = [...ac, outsideArray];
		return ac;
	}, []);
	return reduced;
};
