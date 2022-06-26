const fs = require("fs/promises");
const pdfMerger = require("pdf-merger-js");
const mergePPT = require("./pptMerge");
const merger = new pdfMerger();

const mergeOutputFiles = async (format, outputName) => {
	const testForMergeName = (valueToTest) => {
		const testValue = new RegExp(`${outputName}\.(pptx|ppt|pdf)`, "g");
		return !testValue.test(valueToTest);
	};

	const allFiles = await fs.readdir("./output");
	let fileNames = allFiles.filter(testForMergeName);
//get rid of .gitKeep
  fileNames = allFiles.filter(f=>f!==".gitkeep")
  console.log({fileNames})
	if (fileNames.length === 0) {
		throw new Error("Cannot merge awards: nothing to merge");
	}
	const allowedFormats = ["ppt", "pdf", "pptx"];
	if (!allowedFormats.includes(format)) {
		throw new Error("Incorrect format");
	}
	if (format === "pdf") {
		try {
			fileNames.forEach((fileName) => {
				merger.add(`./output/${fileName}`);
			});
			await merger.save(`./output/${outputName}`);
		} catch (e) {
			throw new Error(e);
		}
	}
	if (format === "ppt" || format === "pptx") {
		const savedAs = await mergePPT(fileNames, "./output", outputName);
		return savedAs;
	}
	// remove individual files from output
	console.log("...removing individual files");
	fileNames.forEach(async (fileName) => {
		await fs.unlink(`./output/${fileName}`);
	});
};

module.exports = mergeOutputFiles;
