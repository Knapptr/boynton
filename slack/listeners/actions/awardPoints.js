const renderPointsModal = require('../../views/modals/awardPoints');
const awardPoints= async ({ ack, client, body }) => {
	await ack();
	client.views.open({
		trigger_id: body.trigger_id,
		view: await renderPointsModal(),
	});
};

module.exports = awardPoints;
