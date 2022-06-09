const { fetchOne, fetchMany } = require("../utils/pgWrapper");
const encrypt = require("../utils/encryptPassword");

const UserRepository = {
  async get(username) {
    const query = "SELECT * from users WHERE username = $1";
    const values = [username];
    const user = await fetchOne(query, values);
    if (!user) {
      return false;
    }
    return user;
  },
  async create({ username, password:unhashedPassword,role }) {
    try {
      const encryptedPassword = await encrypt(unhashedPassword);
      const query =
        "INSERT INTO users (username,password,role) VALUES ($1,$2,$3) RETURNING * ";
      const values = [username, encryptedPassword, role];
      const createdUser = await fetchOne(query, values);
      return createdUser
    } catch (error) {
      return false;
    }
  },
  async delete(username){
    try{     const query = "DELETE FROM users WHERE username = $1 RETURNING username,role";
      const values = [username];
      const deletedUser = await fetchOne(query,values);
      return deletedUser;

    }catch(error){
        return false
    }}
};
module.exports = UserRepository;
