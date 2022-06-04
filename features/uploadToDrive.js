const fs = require("fs/promises");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const uploadFile = async (auth, filePath, fileName, folderID) => {
	const drive = google.drive({ version: "v3", auth });
	try {
		const file = await fs.open(filePath);
		const media = {
			mimeType:
				"application/vnd.openxmlformats-officedocument.presentationml.presentation",
			body: file.createReadStream(),
		};
		const response = await drive.files.create({
			media,
			resource: {
				name: fileName,
				parents: [folderID],
			},
			fields: "id,webViewLink",
		});
		return response.data;
	} catch (e) {
		console.log(e);
		return false;
	}
};
const auth = () => {
	try {
		const serviceAuth = new GoogleAuth({
			keyFile: "./credentials.json",
			scopes: SCOPES,
		});
		return serviceAuth;
	} catch (e) {
		console.log(e);
	}
};
const authAndUpload = async (filePath, fileName, folderID) => {
	const serviceAuth = auth();
	const uploadData = await uploadFile(
		serviceAuth,
		filePath,
		fileName,
		folderID
	);
	return uploadData;
};

module.exports = authAndUpload;