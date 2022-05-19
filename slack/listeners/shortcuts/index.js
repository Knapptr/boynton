const fs = require("fs/promises");
const { getWeek } = require("../../../sheets");
const boyntonAward = require("./boyntonAward");
const authAndUpload = require("../../../uploadToDrive");
const awards = require("../../../Awarder")(getWeek());

const registerShortcuts = (app) => {
	app.shortcut("boyntonAward", boyntonAward);
	app.shortcut("printAwards", async ({ ack, client, body }) => {
		await ack();
		try {
			//open private DM
			const openConversation = await client.conversations.open({
				users: body.user.id,
			});
			const channelID = openConversation.channel.id;
			await awards.loadAwards();
			const savedAs = await awards.renderAwards("pptx");
			const data = await authAndUpload(
				`./output/${savedAs}`,
				savedAs,
				process.env.AWARDS_FOLDER_ID
			);
			console.log(data);
			client.chat.postMessage({
				channel: channelID,
				text: `I've uploaded the awards to Google Drive. Here is a link: ${data.webViewLink}`,
			});
			// const file = await fs.open("./output/merged.pptx");
			// await client.files.upload({
			// 	channels: channelID,
			// 	initial_comment: "Here are the awards you requested. :trophy:",
			// 	file: file.createReadStream(),
			// 	filename: "awards.pptx",
			// });
		} catch (error) {
			console.log(error);
		}
	});
};

module.exports = registerShortcuts;
