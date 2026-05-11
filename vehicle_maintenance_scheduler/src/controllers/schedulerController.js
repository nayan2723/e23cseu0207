const { getSchedules } = require("../services/schedulerService");

const getSchedule = async (req, res) => {
  try {
    const schedules = await getSchedules();

    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getSchedule };
