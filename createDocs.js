const fs = require("fs/promises");
const pizZip = require("pizzip");
const Templater = require("docxtemplater");
const pdfFillForm = require("pdf-fill-form");
const { getWeek, getYear } = require("./sheets");

const generateFileName = (programArea, awardData) => {
	return `${awardData.first}-${awardData.last}_${programArea}-${awardData.awardFor}`;
};

const generateAwardFields = (award) => {
	return {
		awardFor: award.awardFor,
		name: `${award.first} ${award.last}`,
		week: getWeek(`${award.date} ${getYear()}`),
	};
};

const createDocsPPT = async (awardType, awards, templateList) => {
	//get correct template from awardType
	const filePath = templateList.ppt[awardType];

	console.log("using file path", filePath);
	// throw error if no template provided
	if (!filePath) {
		throw new Error("no template provided");
	}

	const templateContent = await fs.readFile(filePath, "binary");

	for (award of awards) {
		const zip = new pizZip(templateContent);
		const template = new Templater(zip);
		// format data
		const awardData = generateAwardFields(award);
		console.log(awardData);
		//fill in template with info
		template.render(awardData);
		const fileBuffer = template
			.getZip()
			.generate({ type: "nodebuffer", compression: "DEFLATE" });
		await fs.writeFile(
			`./output/${generateFileName(awardType, award)}.pptx`,
			fileBuffer
		);
	}
};

const createDocsPDF = async (awardType, awards, templateList) => {
	const filePath = templateList.pdf[awardType];
	// throw error if no template provided
	if (!filePath) {
		throw new Error("no template provided");
	}
	awards.forEach(async (award) => {
		// get awardData
		const awardData = generateAwardFields(award);
		const pdf = pdfFillForm.writeSync(filePath, awardData, { save: "pdf" });
		await fs.writeFile(
			`./output/${generateFileName(awardType, award)}.pdf`,
			pdf
		);
	});
};

module.exports = { createDocsPPT, createDocsPDF };
