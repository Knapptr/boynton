const Camper = require("../../../models/camper");
const { sendCampers } = require("./options");

const onlyAck = async ({ ack }) => {
  await ack();
};
const registerActions = (app) => {
  app.action("open_app", onlyAck);
  app.options("camper_options", sendCampers);
  app.action("camper_options", async ({ ack }) => {
    console.log("selected");
    ack();
  });

  app.action("pronoun_submit", async ({ client, body, respond }) => {
    const pronounInput = body.state.values.pronoun_block.input_action.value;
    const { id: camperId } = JSON.parse(
      body.state.values.camper_select_block.camper_options.selected_option.value
    );
    try {
      const pronouns = pronounInput.toLowerCase().split(" ").join("/");
      const camper = await Camper.getById(camperId);
      if (!camper) {
        throw new Error("Could not find camper");
      }
      await camper.setPronouns(pronouns);
      respond(
        `${camper.firstName} ${camper.lastName}'s pronouns have been set to ${pronouns}`
      );
		console.log(process.env.NOTIFICATIONS_CHANNEL);
		client.chat.postMessage({
			channel: process.env.NOTIFICATIONS_CHANNEL,
			text: `${camper.firstName} ${camper.lastName} prefers ${pronouns} pronouns.`
		})
    } catch (e) {
      respond("That didn't work. Check your inputs.");
    }
  });
};

module.exports = registerActions;
