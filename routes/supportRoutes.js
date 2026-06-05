const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  sendSupportMessage,
  getSupportMessages,
  replySupportMessage
} = require("../controllers/supportController");

router.post(
  "/",
  authMiddleware,
  sendSupportMessage
);

router.get(
  "/",
  authMiddleware,
  getSupportMessages
);

router.put(
  "/:id/reply",
  authMiddleware,
  replySupportMessage
);

module.exports =
  router;