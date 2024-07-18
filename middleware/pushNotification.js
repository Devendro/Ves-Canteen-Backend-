const { Expo } = require("expo-server-sdk")

exports.sendNotification = async (expoPushToken, data) => {
  const expo = new Expo({ accessToken: "RymI-vYmfD5MW3UB4SYqt79N-6n7LIcQMmBm4irj" });

  const chunks = expo.chunkPushNotifications([{ to: expoPushToken, title: data?.title, body: data?.body, useFcmV1: false }]);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }

  let response = "";

  for (const ticket of tickets) {
    if (ticket.status === "error") {
      console.error("Push notification error:", ticket);
      if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
        response = "DeviceNotRegistered";
      }
    }

    if (ticket.status === "ok") {
      response = ticket.id;
    }
  }

  return response;
};
