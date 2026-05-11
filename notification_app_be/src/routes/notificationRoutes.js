const express = require("express");
const router = express.Router();
const { getPriorityInbox } = require("../controllers/notificationController");

router.get("/priority-notifications", getPriorityInbox);

module.exports = router;
