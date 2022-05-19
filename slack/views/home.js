const flEvalURL = require("../../config.json").flEvalURL;
const scheduleBlock = require("./schedule");
const homeView = {
	type: "home",

	blocks: [
		{
			type: "actions",
			block_id: "actions1",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Award!",
						emoji: true,
					},
					action_id: "giveAward",
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Eval FL",
						emoji: true,
					},
					action_id: "flEval",
					url: flEvalURL,
				},
			],
		},

		scheduleBlock,
	],
};

module.exports = homeView;
