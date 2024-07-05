require('dotenv').config();
const encrypt = require("./utils/encryptPassword");

const unhashedPassword = process.argv[1];
const doIt = async ()=>{
const hashed = await encrypt(unhashedPassword)
console.log(hashed);
}

doIt();
