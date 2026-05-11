const express = require("express");
const router = express.Router();
const { testLogger } = require("../controllers/testController");

router.get("/test-log", testLogger);

module.exports = router;
