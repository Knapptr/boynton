const blocks = [
  {
    type: "actions",
	  block_id: "camper_select_block",
    elements: [
      {
        action_id: "camper_options",
        type: "external_select",
        placeholder: {
          type: "plain_text",
          text: "Select a Camper",
        },
        min_query_length: 3,
      },
    ],
  },
  {
    type: "input",
	  block_id: "pronoun_block",
    element: {
      type: "plain_text_input",
      action_id: "input_action",
    },
    label: {
      type: "plain_text",
      text: "Pronouns",
      emoji: true,
    },
	  hint: {type:"plain_text",text:"Don't use slashes here (/) just use a space wherever a slash should be."}
  },
  {
    type: "actions",
	  block_id: "submit_block",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        value: "pronoun_submit_button",
        action_id: "pronoun_submit",
      },
    ],
  },
];
const pronouns = async ({ ack, respond }) => {
  console.log("pronouns");
  await ack();
  respond({ blocks });
};
const registerCommands = (app) => {
  app.command("/pronouns", pronouns);
};

module.exports = registerCommands;
