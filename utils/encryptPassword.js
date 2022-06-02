const bcrypt = require("bcrypt");
const saltRounds = 10;
const encrypt = async (password) => {
	const encrypted = await bcrypt.hash(password, saltRounds);
	return encrypted;
};

module.exports = encrypt;
