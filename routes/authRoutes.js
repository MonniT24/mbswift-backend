const express = require("express");

const multer = require("multer");

const router = express.Router();

const upload = multer({
  storage:multer.memoryStorage()
});

const {
  register,
  login,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  verifyAdminLoginOtp,
  registerRider,
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

router.post(
  "/register-rider",
  upload.single("ghanaCardImage"),
  registerRider
);

// LOGIN

router.post(
  "/login",
  login
);

router.post(
  "/verify-admin-login-otp",
  verifyAdminLoginOtp
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