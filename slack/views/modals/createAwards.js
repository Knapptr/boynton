const ProgramArea = require("../../../models/programArea");

const awardModalHeader = {
	type: "modal",
	callback_id: "boyntonAward",
	title: {
		type: "plain_text",
		text: "Give an Award",
		emoji: true,
	},
	submit: {
		type: "plain_text",
		text: "Award!",
		emoji: true,
	},
	close: {
		type: "plain_text",
		text: "nevermind",
		emoji: true,
	},
};

const updateView = async (index) => {
	const blocks = await getBlocks(index);
	return { ...awardModalHeader, blocks };
};

const awardTypeOpts = (awardTypes) => {
	console.log({ awardTypes });
	return awardTypes.map(area => ({
		"text": {
			"type": "plain_text",
			"text": area.name
		},
		"value": `${area.id}`
	}))

}

const getBlocks = async (index = 0) => {
	const programAreas = await ProgramArea.getAll();
	return [
		{
			type: "input",
			block_id: "awardFor",
			element: {
				type: "plain_text_input",
				action_id: "text",
			},
			label: {
				type: "plain_text",
				text: "Activity / What is the award for?",
				emoji: true,
			},
		},
		{
			type: "input",
			block_id: "camperNames",
			label: { type: "plain_text", text: "Camper Name" },
			element: {
				type: "multi_external_select",
				placeholder: { type: "plain_text", text: "Select Campers" },
				action_id: "camper_options",
			},
		},
		{
			type: "input",
			block_id: "programArea",
			label: { type: "plain_text", text: "Award Type" },
			element: {
				type: "static_select",
				placeholder: { type: "plain_text", text: "Select an award type" },
				options: awardTypeOpts(programAreas)
			},
		}
	];
};

module.exports = updateView;
