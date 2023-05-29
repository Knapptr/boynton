const usersHandler = require("../handlers/usersHandler");

const userRouter = require("express").Router();


userRouter.get("/", usersHandler.getAll);
userRouter.post("/", usersHandler.create);

module.exports = userRouter;
