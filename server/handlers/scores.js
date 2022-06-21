const Score = require('../../models/score');
module.exports = {
  async getAll(req,res){
    const {to,week,awardedfor} = req.query;
    try{
      let scores = await Score.getAll();
      if(to){
        scores = scores.filter(s=>s.awardedTo === to.toUpperCase());
      }
      if(week){
        scores = scores.filter(s=>s.weekNumber===Number.parseInt(week));
      }
      if(awardedfor){
        scores = scores.filter(s=>s.awardedFor===awardedfor);
      }

      res.json(scores);
    }catch (e){
      console.log(e);
      res.status(500);
      res.send(e);
    }
  },
  async insert(req,res){
    const {awardedTo,points,awardedFor,weekNumber} = req.body;
    try{
      scoreToInsert= {awardedTo,points,awardedFor,weekNumber };
      const createdScore= await Score.create(scoreToInsert);
      res.json(createdScore);
    }catch (e){
      res.status(500);
      res.send(e);
    }
  }
}
