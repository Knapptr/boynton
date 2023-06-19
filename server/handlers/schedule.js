const schedule = require("../../campData/schedule");

module.exports = {
 all: (req,res,next)=>{
    res.json(schedule)
 }
}
