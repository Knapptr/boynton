const awardModal = require("../../views/modals/createAwards");

const boyntonAward = async ({ shortcut, ack, client }) => {
	await ack();
	client.views.open({
		trigger_id: shortcut.trigger_id,
		view: await awardModal(),
	});
};

module.exports = boyntonAward;
