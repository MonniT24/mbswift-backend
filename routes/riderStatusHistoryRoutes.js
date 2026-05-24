const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAllRiderStatusHistories
} = require("../controllers/riderStatusHistoryController");

router.get(
  "/",
  authMiddleware,
  getAllRiderStatusHistories
);

module.exports = router;