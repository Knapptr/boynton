const authRole = {
  adminOnly(req, res, next) {
    if (req.user.role !== "admin") {
      res.sendStatus(401)
      return;
    }
    next();
    return;
  },
  unitHeadOnly(req, res, next) {
    if (req.user.role !== "admin" && req.user.role !== "unit_head") {
      res.sendStatus(401)
      return;
    }
    next();
    return;
  },
  programmingOnly(req, res, next) {
    if (req.user.role !== "admin" && req.user.role !== "unit_head" && req.user.role !== "programming") {
      res.sendStatus(401)
      return;
    }
    next();
    return;
  }
}

module.exports = authRole;
