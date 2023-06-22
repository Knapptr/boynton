const pool = require("./db/index");
const dbInit = require("./db.init");

const main = async ()=>{
  // Delete everything except for users
await pool.query("DELETE FROM WEEKS;")
await pool.query("DELETE FROM CABINS;")
await pool.query("DELETE FROM CAMPERS;")
await dbInit();
console.log("Ok. Database reset. You will need to run config-uploader.js on whatever app you just reset (dev, production etc)")



}

main();
