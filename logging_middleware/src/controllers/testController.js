const Log = require("../middleware/logger");

const testLogger = async (req, res) => {
  try {
    await Log("backend", "info", "controller", "Testing logging middleware");

    res.status(200).json({
      success: true,
      message: "Logger working"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { testLogger };
