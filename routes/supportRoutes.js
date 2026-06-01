const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

  const upload =
  require("../middleware/upload");

const {
  sendSupportMessage,
  getSupportMessages,
  replySupportMessage
} = require("../controllers/supportController");

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
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