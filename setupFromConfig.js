require('dotenv').config()
const config = require("./config");
const Config = require("./models/config");


const setup = async () => {
  console.log("Adding config to database.")
  await Config.load(config);
  console.log("Done.");
  process.exit();
}

setup();
