const pool = require("../../../db/index");

const sendCampers = async ({ ack, payload }) => {
	console.log({v:payload.value})
	console.log("Thing happened");
	const value = payload.value;
	const values = [`^${value}`];
	const camperResults = await pool.query(
		"SELECT * from campers where first_name ~* $1 OR last_name ~* $1",
		values
	);
	const results = camperResults.rows;
	const options = results.map((camper) => {
		return {
			value: JSON.stringify({
				id: camper.id,
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


module.exports = { sendCampers };
