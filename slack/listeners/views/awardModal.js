const channelToPostCongratulations = "C03E82QGM53";
const awards = require("../../../Awarder")(1);

const namesPrint = (namesList) => {
	return namesList
		.map((name) => {
			return `*_${name.first} ${name.last}_*`;
		})
		.join(", ")
		.replace(/,(?=[^,]+$)/, " and");
};
const mapAwards = (namesList, awardFor) => {
	const awards = namesList.map((name) => {
		return { first: name.first, last: name.last, awardFor: awardFor };
	});
	return awards;
};

const awardOrAwards = (namesList) => {
	if (namesList.length === 1) {
		return "an award";
	}
	return "awards";
};

const submitAwardView = async ({ ack, view, client }) => {
	await ack();
	const awardFor = view.state.values.awardFor.text.value;
	const names =
		view.state.values.camperNames.camper_options.selected_options.map(
			(camper) => JSON.parse(camper.value)
		);
	const programArea =
		view.state.values.programArea.select.selected_option.value;
	awards.add(programArea, mapAwards(names, awardFor));
	await awards.save();
	client.chat.postMessage({
		channel: channelToPostCongratulations,
		text: `${namesPrint(names)} just received ${awardOrAwards(
			names
		)} for ${awardFor}!`,
	});
};

module.exports = submitAwardView;
