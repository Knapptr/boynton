const parseSchedule = require('./parse');
const insertActivities = require('./insert');

const main = (weekNumber)=>{
  return parseSchedule(weekNumber).then((s)=> insertActivities(s));
}

module.exports = main;
