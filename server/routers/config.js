const router = require("express").Router();
const configHandler = require("../handlers/config");

router.post("/", configHandler.create);

module.exports = router;
