require('dotenv').config()
// const config = require("./config");
const Config = require("./models/config");

const [ex, cpath, configYear] = process.argv;

VALIDYEARS = {
  2022: "./config/2022.config",
  2023: "./config/2023.config"
}

if (!VALIDYEARS[configYear]) {
  console.log("Invalid Year");
  process.exit(1);
}

const config = require(`${VALIDYEARS[configYear]}`)

const setup = async () => {
  console.log("Adding config to database.")
  await Config.load(config);
  console.log("Done.");
  process.exit();
}

setup();
