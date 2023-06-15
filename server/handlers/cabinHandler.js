const Cabin = require("../../models/cabin");
const cabinHandler = {
	async getAllCabins(req, res, next) {
		let cabins = await Cabin.getAll(true);
		const week = req.query.week;
		const area = req.query.area ? req.query.area.toUpperCase() : false;
		if (area) {
			cabins = cabins.filter((cabin) => cabin.area === area);
		}
		if (week) {
			cabins = cabins.filter((cabin) => {
				cabin.sessions.some((session) => (session.weekNumber = week));
			});
		}
		res.json(cabins);
	},
	async getOneCabin(req, res, next) {
		let cabin = await Cabin.getOne({ name: req.params.cabinName });
		if (cabin) {
			await cabin.init();
		}
		res.json(cabin);
	},
};

module.exports = cabinHandler;
