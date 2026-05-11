const api = require("../config/axiosConfig");

const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "auth",
  "config",
  "middleware",
  "utils"
];

const Log = async (stack, level, pkg, message) => {
  try {
    if (!validStacks.includes(stack)) {
      console.error(`Invalid stack: ${stack}. Allowed: ${validStacks.join(", ")}`);
      return;
    }

    if (!validLevels.includes(level)) {
      console.error(`Invalid level: ${level}. Allowed: ${validLevels.join(", ")}`);
      return;
    }

    if (!validPackages.includes(pkg)) {
      console.error(`Invalid package: ${pkg}. Allowed: ${validPackages.join(", ")}`);
      return;
    }

    const response = await api.post("/logs", {
      stack,
      level,
      package: pkg,
      message
    });

    console.log("Log added:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Logging failed:", error.response.status, error.response.data);
    } else {
      console.error("Logging error:", error.message);
    }
  }
};

module.exports = Log;
