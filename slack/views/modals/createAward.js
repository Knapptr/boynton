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

const giveAwardModal = () => {
	return { ...awardModalHeader, blocks: blocks };
};

const blocks = [
	{
		type: "input",
		block_id: "programArea",
		element: {
			type: "static_select",
			placeholder: {
				type: "plain_text",
				text: "Select a Program Area",
				emoji: true,
			},
			options: [
				{
					text: {
						type: "plain_text",
						text: "Creative Arts",
						emoji: true,
					},
					value: "arts",
				},
				{
					text: {
						type: "plain_text",
						text: "Challenge Activities",
						emoji: true,
					},
					value: "challenge",
				},
				{
					text: {
						type: "plain_text",
						text: "Waterfront",
						emoji: true,
					},
					value: "waterfront",
				},
				{
					text: {
						type: "plain_text",
						text: "Nature",
						emoji: true,
					},
					value: "nature",
				},
			],
			action_id: "select",
		},
		label: {
			type: "plain_text",
			text: "Program Area",
			emoji: true,
		},
	},
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
		block_id: "names",
		element: {
			type: "plain_text_input",
			action_id: "text",
		},
		label: {
			type: "plain_text",
			text: "Names (must include first and last, separate each pair with a comma)",
			emoji: true,
		},
	},
];

module.exports = giveAwardModal();
