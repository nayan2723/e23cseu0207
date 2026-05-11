const knapsack = (tasks, maxHours) => {
  const n = tasks.length;
  const dp = [];

  for (let i = 0; i <= n; i++) {
    dp[i] = [];
    for (let w = 0; w <= maxHours; w++) {
      dp[i][w] = 0;
    }
  }

  for (let i = 1; i <= n; i++) {
    const duration = tasks[i - 1].duration;
    const impact = tasks[i - 1].impact;

    for (let w = 0; w <= maxHours; w++) {
      if (duration <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - duration] + impact);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const maxImpact = dp[n][maxHours];

  const selectedTasks = [];
  let w = maxHours;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedTasks.push(tasks[i - 1]);
      w -= tasks[i - 1].duration;
    }
  }

  selectedTasks.reverse();

  return { maxImpact, selectedTasks };
};

module.exports = knapsack;
