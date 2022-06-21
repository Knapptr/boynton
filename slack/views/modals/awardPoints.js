const pointsModalHeader = {
  type: "modal",
  callback_id:"awardPoints",
  title: {
    type: "plain_text",
    text: "Award Points",
    emoji: true,
  },
  submit: {
    type: "plain_text",
    text: "Give points",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "nevermind",
    emoji: true,
  },
};

const blocks = [
  {
    type: "input",
    block_id: "tribe",
    element: {
      type: "static_select",
    action_id: "select",
      placeholder: {
        type: "plain_text",
        text: "Who gets the points?",
        emoji: true,
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "Naumkeag",
            emoji: true,
          },
          value: "N",
        },
        {
          text: {
            type: "plain_text",
            text: "Tahattawan",
            emoji: true,
          },
          value: "T",
        },
      ],
    },
    label: {
      type: "plain_text",
      text: "Who are the points for?",
      emoji: true,
    },
  },
  {
    type: "input",
    block_id: "awardedFor",
    element: {
      type: "plain_text_input",
      action_id: "text",
    },
    label: {
      type: "plain_text",
      text: "What are the points for?",
      emoji: true,
    },
  },
  {
    type: "input",
    block_id: "points",
    element: {
      type: "plain_text_input",
      action_id: "text",
    },
    label: {
      type: "plain_text",
      text: "How many points?",
      emoji: true,
    },
  },
];
const renderBlock = () => {
  return { ...pointsModalHeader, blocks };
};
module.exports = renderBlock;
