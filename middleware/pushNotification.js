const { Expo } = require("expo-server-sdk");

exports.sendNotification = async (expoPushToken, data) => {
  const expo = new Expo({ accessToken: "RymI-vYmfD5MW3UB4SYqt79N-6n7LIcQMmBm4irj" });

  // Validate token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Invalid Expo push token: ${expoPushToken}`);
    return "InvalidToken";
  }

  // Create messages array
  const messages = [
    {
      to: expoPushToken,
      sound: 'default',
      title: data?.title ?? "Notification",
      body: data?.body ?? "",
      data: data?.extraData ?? {}, // optional additional data
    }
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  let response = "";

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }

  for (const ticket of tickets) {
    if (ticket.status === "error") {
      console.error("Push notification error:", ticket);
      if (ticket.details?.error === "DeviceNotRegistered") {
        response = "DeviceNotRegistered";
      }
    }

    if (ticket.status === "ok") {
      response = ticket.id;
    }
  }

  return response;
};
