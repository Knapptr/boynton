const config = JSON.parse(process.env.CONFIG);
const Week = require("./models/week");
const Days = require('./models/day');
const Day = require("./models/day");

const setup = () => {
  const insertAll = async () => {
    const { weeks } = config;
    const weekNumbers = Object.keys(weeks)
    const insertedWeeks = await Promise(
      weekNumbers.map((wn) => Week.create({ title: weeks[wn].title, number: wn }))
    );
    const configDays = config.scheduleDays
    const daysToInsert = weekNumbers.map(w=> ({weekNumber:w,days:[...configDays]}))
      
  };
};
