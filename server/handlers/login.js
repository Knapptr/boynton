const authenticate = require("../../utils/authenticate");
const error = require("../../utils/jsonError");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

module.exports = {
  async login(req, res) {
    const { username, password } = req.body;
    // if (!username || !password) {
    // 	res.status(400).json(error("No username or password"));
    // 	return;
    // }
     const authResponse = await User.authenticate({
      username,
      password,
    });
    if(!authResponse){res.status(401);res.json(error('Not authorized'))}
    const { user, isAuthenticated } = authResponse;
    console.log({ isAuthenticated });
    if (!isAuthenticated) {
      res.status(401);
      res.json(error("Not authorized"));
      return;
    }
    //give json token
    const token = jwt.sign(
      { userName: user.username, role: user.role },
      process.env.JWT_SECRET
    );
    const userInfo = {
      userName:user.username,
      role:user.role,
    };
    res.json({ token, user: userInfo });
  },
  async create(req, res) {
    const { username, password, role } = req.body;
    try {
      const user = await User.create({username, password, role});
      res.json({ username: user.username,role:user.role });
    } catch (e) {
      res.status(500);
      res.send(e.message);
    }
  },
};
