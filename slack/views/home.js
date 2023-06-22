const ROOTURL = process.env.ROOTURL;
const homeView = {
  type: "home",

  blocks: [
    {
      type: "actions",
      block_id: "actions1",
      elements: [
        {
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Open App",
						"emoji": true
					},
                    "action_id":"open_app",
					"url": "https://campleslie.xyz"
				}
      ],
    },
  ],
};

module.exports = homeView;
