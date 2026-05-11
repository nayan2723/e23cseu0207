const axios = require("axios");
require("dotenv").config();

const api = axios.create({
  baseURL: "http://20.244.56.144/evaluation-service",
  headers: {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  }
});

module.exports = api;
