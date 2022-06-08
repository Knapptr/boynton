const authenticate = require("../../utils/authenticate");
const error = require("../../utils/jsonError");
const User = require('../../models/User');
const jwt = require("jsonwebtoken");
module.exports = {
	async login(req, res) {
		const { username, password } = req.body;
		if (!username || !password) {
			res.status(400).json(error("No username or password"));
			return;
		}
		const isAuthenticated = await authenticate(username, password);
		console.log({ isAuthenticated });
		if (!isAuthenticated) {
			res.status(401);
			res.json(error("Not authorized"));
			return;
		}
		//give json token
		const token = await jwt.sign(
      { userName: isAuthenticated.username,role:isAuthenticated.role },
			process.env.JWT_SECRET
		);
    const userInfo = {userName: isAuthenticated.username,role:isAuthenticated.role}
    res.json({ token,user:userInfo });
	},
  async create(req,res){
    const {username,password,role} = req.body;
    if(!username || !password){
      res.status(400).json(error("No username or password"))
      return
    }
    try{
      const user =  await User.create(username,password,role);
      res.json({username: user.username});
    }catch (e){
      console.log(e);
      res.sendStatus(500)
    }
  }
};
