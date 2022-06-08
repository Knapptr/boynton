const authRole = {
  adminOnly(req,res,next){
    if(req.user.role !== "admin"){
      res.sendStatus(401)
      return;
    }
    next();
    return;
  },
  unitHeadOnly(req,res,next){
    if(req.user.role !== "admin" || req.user.role !== "unitHead"){
      res.sendStatus(401)
      return;
    }
    next();
    return;
  }
}

module.exports = authRole;
