const router = require('express').Router();
const paHandler = require("../handlers/programAreas");

router.get("/", paHandler.getAll);
router.post("/", paHandler.create);

module.exports = router
