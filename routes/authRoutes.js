const express = require("express");

const router = express.Router();

const {
  register,
  login,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword
} = require("../controllers/authController");

// REGISTER OTP

router.post(
  "/send-registration-otp",
  sendRegistrationOtp
);

router.post(
  "/verify-registration-otp",
  verifyRegistrationOtp
);

// REGISTER

router.post(
  "/register",
  register
);

// LOGIN

router.post(
  "/login",
  login
);

// FORGOT PASSWORD OTP

router.post(
  "/forgot-password-send-otp",
  sendForgotPasswordOtp
);

router.post(
  "/forgot-password-verify-otp",
  verifyForgotPasswordOtp
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;