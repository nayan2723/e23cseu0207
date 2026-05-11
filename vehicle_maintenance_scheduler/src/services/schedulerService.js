const api = require("../config/axiosConfig");
const knapsack = require("../utils/knapsack");

const getSchedules = async () => {
  try {
    const depotsRes = await api.get("/depots");
    const vehiclesRes = await api.get("/vehicles");

    const depots = depotsRes.data.depots;
    const vehicles = vehiclesRes.data.vehicles;

    const tasks = vehicles.map(v => ({
      taskId: v.TaskID,
      duration: v.Duration,
      impact: v.Impact
    }));

    const schedules = [];

    for (const depot of depots) {
      const availableHours = depot.MechanicHours;
      const result = knapsack(tasks, availableHours);

      schedules.push({
        depotID: depot.ID,
        availableHours,
        totalImpact: result.maxImpact,
        selectedTasks: result.selectedTasks
      });
    }

    console.log("Schedules generated successfully");
    return schedules;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error;
  }
};

module.exports = { getSchedules };
