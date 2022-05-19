const sayWhat = require("./sayWhat");

const registerMessages = (app) => {
	const bQuotes = new RegExp(/b"[^"]*"/, "ig");
	app.message(bQuotes, async ({ message, say }) => {
		const getContent = (bQuoteString) => {
			const content = bQuoteString.slice(2, -1);
			return content;
		};
		const replaceFirst = (string) => {
			const vowels = /[aeiouy]/;
			const words = string.split(" ");
			const wordsWithBs = words.map((word) => {
				if (
					word.length > 2 ||
					(word.length === 2 && vowels.test(word[1]))
				) {
					return word.replace(/^[a-z,A-Z]/, "B");
				}
				return `B${word}`;
			});
			return wordsWithBs.join(" ");
		};
		const formatMessage = (listOfReplacements) => {
			return listOfReplacements.join("\n");
		};
		const matches = message.text.match(bQuotes);
		const wordsToReplace = matches.map(getContent);
		const replacements = wordsToReplace.map(replaceFirst);
		say(formatMessage(replacements));
	});
};

module.exports = registerMessages;
