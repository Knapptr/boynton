const usersHandler = require("../handlers/usersHandler");

const userRouter = require("express").Router();


userRouter.get("/", usersHandler.getAll);
userRouter.post("/", usersHandler.create);
userRouter.delete("/:username", usersHandler.delete);
userRouter.put("/:username", usersHandler.update);

module.exports = userRouter;
