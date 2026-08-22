const express = require("express");

const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

const router =
  express.Router();

// ============================================
// Register
// ============================================

router.post(
  "/register",
  register
);

// ============================================
// Login
// ============================================

router.post(
  "/login",
  login
);

// ============================================
// Verify Email
// ============================================

router.get(
  "/verify-email",
  verifyEmail
);

// ============================================
// Resend Verification
// ============================================

router.post(
  "/resend-verification",
  resendVerificationEmail
);

module.exports = router;