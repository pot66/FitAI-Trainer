const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  verifyRegisterOtp,
  resendRegisterOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword,
  requestChangePasswordOtp,
  confirmChangePassword,
} = require("../controllers/authController");

const router = express.Router();

// ============================================
// Registration & Verification
// ============================================
router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/resend-register-otp", resendRegisterOtp);

// ============================================
// Login
// ============================================
router.post("/login", login);

// ============================================
// Forgot Password Flow
// ============================================
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset", resetForgotPassword);

// ============================================
// Change Password (Authenticated)
// ============================================
router.post("/change-password/request-otp", authMiddleware, requestChangePasswordOtp);
router.post("/change-password/confirm", authMiddleware, confirmChangePassword);

// ============================================
// Legacy Email Verification Link Support
// ============================================
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
