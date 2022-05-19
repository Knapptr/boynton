const awardModal = require("../../views/modals/createAwards");

const giveAward = async ({ ack, client, body }) => {
	await ack();
	client.views.open({
		trigger_id: body.trigger_id,
		view: await awardModal(),
	});
};

module.exports = giveAward;
