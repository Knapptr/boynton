const fs = require("fs/promises");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const getTemplate = async (templatePath) => {
	const file = await fs.readFile(templatePath, "binary");
	return file;
};

const dataExample = {
	first: "Tyler",
	last: "Knapp",
	for: "Making this work",
};

const generate = async (templatePathOrBuffer, data) => {
	let template;
	if (templatePathOrBuffer.slice(0, 2) === "./") {
		template = await getTemplate(templatePathOrBuffer);
	} else {
		template = templatePathOrBuffer;
	}
	const zip = new PizZip(template);
	const doc = new Docxtemplater(zip);

	doc.render(data);
	const buf = doc
		.getZip()
		.generate({ type: "nodebuffer", compression: "DEFLATE" });
	fs.writeFile("./output.pptx", buf);
};
