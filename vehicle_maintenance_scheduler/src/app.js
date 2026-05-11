const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const schedulerRoutes = require("./routes/schedulerRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", schedulerRoutes);

module.exports = app;
