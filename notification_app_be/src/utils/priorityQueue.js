const typeWeights = {
  Placement: 100,
  Result: 70,
  Event: 40
};

const getRecencyScore = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const hoursAgo = (now - notifTime) / (1000 * 60 * 60);

  if (hoursAgo <= 1) return 50;
  if (hoursAgo <= 6) return 35;
  if (hoursAgo <= 24) return 20;
  if (hoursAgo <= 72) return 10;
  return 0;
};

const getPriorityNotifications = (notifications) => {
  const scored = notifications.map(notif => {
    const typeScore = typeWeights[notif.Type] || 0;
    const recencyScore = getRecencyScore(notif.Timestamp);
    const priorityScore = typeScore + recencyScore;

    return {
      ...notif,
      priorityScore
    };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.slice(0, 10);
};

module.exports = getPriorityNotifications;
