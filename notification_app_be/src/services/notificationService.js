const api = require("../config/axiosConfig");
const getPriorityNotifications = require("../utils/priorityQueue");

const fetchPriorityNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    const notifications = response.data.notifications;

    const prioritized = getPriorityNotifications(notifications);

    return prioritized;
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    throw error;
  }
};

module.exports = { fetchPriorityNotifications };
