const router = require("express").Router();
const path = require("path");

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../../documentation/main.html"))
})
router.get("/health", (req,res) => res.send("OK"))
module.exports = router;
