const { fetchPriorityNotifications } = require("../services/notificationService");

const getPriorityInbox = async (req, res) => {
  try {
    const notifications = await fetchPriorityNotifications();

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getPriorityInbox };
