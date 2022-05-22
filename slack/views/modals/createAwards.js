const fs = require("fs/promises");
const csvParser = require("csv-parser");

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

const getBlocks = async (index = 0) => {
	return [
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
			block_id: "camperNames",
			label: { type: "plain_text", text: "Camper Name" },
			element: {
				// type: "multi_static_select",
				type: "multi_external_select",
				placeholder: { type: "plain_text", text: "Select Campers" },
				action_id: "camper_options",
				// action_id: "select",
				// option_groups: await createCamperSelectionOptions(),
			},
		},
	];
};

const parseCamperOptions = (campers) => {
	const withSessions = campers.map((camper) => {
		return {
			first: camper.first,
			last: camper.last,
			gender: camper.gender,
			sessions: camper.sessions.split(",").map((s) => s.trim()),
		};
	});
	const bySession = {};

	withSessions.forEach((camper) => {
		camper.sessions.forEach((session) => {
			if (!bySession[session]) {
				bySession[session] = [];
			}
			bySession[session].push(camper);
		});
	});
	return bySession;
};
const loadCSV = async () => {
	const data = new Promise(async (resolve, reject) => {
		const campers = [];
		const csv = await fs.open("2022campers.csv");
		try {
			csv.createReadStream()
				.pipe(
					csvParser({
						headers: [
							"index",
							"last",
							"first",
							"gender",
							"sessions",
						],
						skipLines: 1,
					})
				)
				.on("data", (data) => {
					campers.push(data);
				})
				.on("end", () => {
					resolve(campers);
				});
		} catch (e) {
			reject(e);
		}
	});
	return data;
};
const createCamperSelectionOptions = async () => {
	const campers = await loadCSV();
	const bySession = parseCamperOptions(campers);
	const sessions = Object.keys(bySession);

	const optionGroups = [];
	sessions.forEach((session) => {
		const group = {
			label: { type: "plain_text", text: session },
			options: [],
		};
		bySession[session].forEach((camper) => {
			group.options.push({
				text: {
					type: "plain_text",
					text: `${camper.first} ${camper.last}`,
				},
				value: JSON.stringify({
					first: camper.first,
					last: camper.last,
				}),
			});
		});
		optionGroups.push(group);
	});

	return optionGroups;
};
module.exports = updateView;
