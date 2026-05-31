const express = require("express");

const router = express.Router();

const {
  register,
  login,
  sendRegistrationOtp,
  verifyRegistrationOtp
} = require("../controllers/authController");

// REGISTER

router.post(
  "/send-registration-otp",
  sendRegistrationOtp
);

router.post(
  "/verify-registration-otp",
  verifyRegistrationOtp
);

router.post(
  "/register",
  register
);

// LOGIN

router.post(
  "/login",
  login
);

module.exports = router;