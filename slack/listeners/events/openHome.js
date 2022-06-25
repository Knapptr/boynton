const homeView = require("../../views/home");
const openHome = async ({ client, payload, event }) => {
	console.log("opened home");
  console.log(JSON.parse( process.env.CONFIG ))
	client.views.publish({
		user_id: event.user,
		view: homeView,
	});
};

module.exports = openHome;
