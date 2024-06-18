require("dotenv").config();
const { Pool, Client } = require("pg");

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DB,
	password: process.env.PG_PW,
	port: process.env.PG_PORT
	// poolSize: 10
});



module.exports = pool;
