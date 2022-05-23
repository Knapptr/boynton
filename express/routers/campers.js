const router = require("express").Router();
const Camper = require("../../models/camper");

router.get("/", async (req, res) => {
	const campers = await Camper.getAll();
	res.json(campers);
});
router.get("/:area(ba|ga)", async (req, res) => {
	console.log(req.params);
	const area = req.params.area;
	const campers = await Camper.getByArea(area);
	res.json(campers);
});

module.exports = router;
