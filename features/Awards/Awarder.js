//const { getAwards, addAwards, getYear } = require("./sheets");
//const createAwardBatch = require("./batch");
//const mergeOutputFiles = require("./merge");
//const { getWeek } = require("./sheets");
//const parse = require("./parse");

//const _ = require("lodash");
//const Awarder = (awardWeek = getWeek()) => {
//	return {
//		list: {},
//		unsavedAwards: {},
//		async loadAwards() {
//			this.list = await getAwards(awardWeek);
//		},
//		add(programArea, awards) {
//			if (!this.unsavedAwards[programArea]) {
//				this.unsavedAwards[programArea] = [];
//			}
//			console.log("adding", awards);
//			this.unsavedAwards[programArea].push(...awards);
//		},
//		parse,
//		get week() {
//			return awardWeek;
//		},
//		get unsavedAwardAreas() {
//			return _.keys(this.unsavedAwards);
//		},
//		get all() {
//			//add unsaved awards by key to  list
//			const savedUnsavedValues = { ...this.list };
//			this.unsavedAwardAreas.forEach((area) => {
//				if (!savedUnsavedValues[area]) {
//					savedUnsavedValues[area] = [];
//				}
//				savedUnsavedValues[area].push(...this.unsavedAwards[area]);
//			});
//			return savedUnsavedValues;
//		},
//		async save() {
//			const awardsToAdd = [];
//			this.unsavedAwardAreas.forEach((unsavedArea) => {
//				this.unsavedAwards[unsavedArea].forEach((award) => {
//					awardsToAdd.push({ ...award, programArea: unsavedArea });
//				});
//			});
//			try {
//				await addAwards(awardsToAdd);
//				this.unsavedAwards = [];
//				await this.loadAwards();
//			} catch (e) {
//				throw new Error("Error Saving awards", e);
//			}
//		},
//		getFileName(extension) {
//			return `${getYear()}-Awards-Week${this.week}.${extension}`;
//		},
//		async renderAwards(format) {
//			try {
//				await createAwardBatch(this.all, format);
//				const savedAs = await mergeOutputFiles(
//					format,
//					this.getFileName(format)
//				);
//				return savedAs;
//			} catch (e) {
//				throw new Error(`Error rendering awards: ${e}`);
//			}
//		},
//	};
//};

//module.exports = Awarder;
