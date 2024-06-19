// uses slack webhooks to easily send messages. Super powerful.
const sendToNotifications = async (message) => {
  const url = process.env.NOTIFICATIONS_CHANNEL || process.env.DEV_CHANNEL;
  const result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(message),
  });
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
};
