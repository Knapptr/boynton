const bcrypt = require("bcrypt");

const compare = async (password, hashedPassword) => {
	console.log("Comparing", password, hashedPassword);
	const result = await bcrypt.compare(password, hashedPassword);
	return result;
};

module.exports = compare;
