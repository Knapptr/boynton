const { templatePaths, programAreas } = require("./config.json");
const { createDocsPDF, createDocsPPT } = require("./createDocs");

const createAwardBatch = async (awards, format) => {
	const programAreas = Object.keys(awards);

	if (!["pdf", "pptx"].includes(format)) {
		throw new Error('format must be "pdf" or "pptx"');
	}
	const createDocsFormat = {
		pdf: createDocsPDF,
		pptx: createDocsPPT,
	}[format];
	for (programArea of programAreas) {
		try {
			console.log(`creating ${programArea} awards:`);
			await createDocsFormat(
				programArea,
				awards[programArea],
				templatePaths
			);
		} catch (e) {
			console.log("ERROR:", e);
		}
	}
};

module.exports = createAwardBatch;
