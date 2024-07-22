const ActivityLocation = require( "../../models/ActivityLocation");

const activityLocationHandler = {
  getAll: [
    async (req, res, next) => {
      const locations = await ActivityLocation.getAll();
      res.json(locations);
    },
  ],
};

module.exports = activityLocationHandler;
