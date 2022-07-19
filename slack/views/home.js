const { flEvalURL  }= JSON.parse(process.env.CONFIG);
const ROOTURL = process.env.ROOTURL;
const attendanceURL =`${ROOTURL}/attendance` 
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
						text: "Attendance",
						emoji: true,
					},
          url: attendanceURL
				},
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
						text: "Give Points",
						emoji: true,
					},
					action_id: "awardPoints",
				},

				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Eval FL",
						emoji: true,
					},
					url: flEvalURL,
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Activity Sign Up",
						emoji: true,
					},
					url: `${ROOTURL}/schedule/sign-up`,
				},
			],
		},
	],
};

module.exports = homeView;
