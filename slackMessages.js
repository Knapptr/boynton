// uses slack webhooks to easily send messages. Super powerful.
const sendToCamperInfo = async (message) => {
  console.log("Sending Camper Notification");
  if (process.env.SEND_CAMPER_NOTIFICATIONS === "True") {
    const url = process.env.CAMPER_INFO_URL || process.env.DEV_CHANNEL;

    const result = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message),
    });
  }
};
const sendToNotifications = async (message) => {
  if (process.env.SEND_NOTIFICATIONS === "True") {
    const url = process.env.NOTIFICATIONS_CHANNEL || process.env.DEV_CHANNEL;
    const result = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message),
    });
  }
};
const sendToDev = async (message) => {
  const url = process.env.DEV_CHANNEL;
  const result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(message),
  });
};

const sendToMe = async (message) => {
  const url = process.env.DM_ME;
  const result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(message),
  });
};

module.exports = {
  sendToDev,
  sendToNotifications,
  sendToMe,
  sendToCamperInfo,
};
