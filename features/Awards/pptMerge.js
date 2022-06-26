const { Automizer } = require("pptx-automizer");
const fs = require("fs/promises");

const mergePPT = async (fileNames, path = "./output", outputName) => {
  console.log('merging')
	const filesWithNoMerged = fileNames.filter((name) => name !== outputName);
	const root = filesWithNoMerged.pop();
	const automizer = new Automizer({ templateDir: path, outputDir: path });
	const pres = automizer.loadRoot(root);
	filesWithNoMerged.forEach((file) => {
		pres.load(file);
	});
	filesWithNoMerged.forEach((file) => {
		pres.addSlide(file, 1);
	});
	await pres.write(outputName);
	return outputName;
};

module.exports = mergePPT;
