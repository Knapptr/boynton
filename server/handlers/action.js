const populateList = require('../../features/Schedule/main');
const actionController = {
  populateActivityList(req,res,next){
    const weekNumber = req.params.weekNumber
    populateList(weekNumber).then(()=>{
      res.status(200);
      res.send('ok');
    }).catch((e)=>{
      res.status(500);
      res.send(e);
    })
  }
}

module.exports = actionController
