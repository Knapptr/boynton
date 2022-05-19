const pool = require("../../../db/index");
const sendOptions = async ({ ack, payload }) => {
	const value = payload.value;
	const values = [`^${value}`];
	const camperResults = await pool.query(
		"SELECT * from campers where first_name ~* $1 OR last_name ~* $1",
		values
	);
	const campers = camperResults.rows;
	const results = camperResults.rows;
	const options = results.map((camper) => {
		return {
			value: JSON.stringify({
				first: camper.first_name,
				last: camper.last_name,
			}),
			text: {
				type: "plain_text",
				text: camper.first_name + " " + camper.last_name,
			},
		};
	});
	await ack({ options });
};

module.exports = sendOptions;
