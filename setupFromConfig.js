require('dotenv').config()
const config = JSON.parse(process.env.CONFIG);
const Week = require("./models/week");
const Day = require("./models/day");
const Period = require("./models/period");
const Cabin = require('./models/cabin');
const CabinSession = require('./models/cabinSession');

const setup = () => {
  const insertAll = async () => {
    const { weeks } = config;
    const weekNumbers = Object.keys(weeks)
    const insertedWeeks = await Promise.all(
      weekNumbers.map((wn) => Week.create({ title: weeks[wn].title, number: wn }))
    );
    const configDays = config.scheduleDays;
    for(let week of insertedWeeks){
      for(let cDay of configDays){
        console.log({week,cDay});
        const createdDay = await Day.create({name:cDay.day,weekNumber:week.number})
        for(let pNumber = 1; pNumber <= cDay.periods;pNumber++){
          const createdPeriod = await Period.create({number:pNumber,dayId:createdDay.id})
          console.log("created week",week.number,"created day",createdDay.name,"created period",createdPeriod.number)
        }
      }
    }
    //cabins and cabin sessions
    const {cabins} = config;
    const insertedCabins = await Promise.all(cabins.map(c=>(Cabin.create({name:c.name,capacity:c.capacity,area:c.area}))))
    await Promise.all(insertedWeeks.map(w=>Promise.all(insertedCabins.map(c=>c.createSession(w.number)))));
  }
  insertAll();
}
setup();
