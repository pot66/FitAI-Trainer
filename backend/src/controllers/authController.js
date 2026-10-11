const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../services/prisma");
const crypto = require("crypto");
const { appConfig } = require("../config");

// Email delivery handled via otpService

const {
  createAndSendOtp,
  verifyOtp,
} = require("../services/otpService");

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// 1. REGISTER WITH OTP
// ============================================

async function register(req, res) {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อ Email และ Password",
      });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบ Email ไม่ถูกต้อง",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password ต้องมีอย่างน้อย 8 ตัวอักษร",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user registered before but never verified email, allow them to re-verify OTP!
      if (!existingUser.emailVerified) {
        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { name, passwordHash },
        });

        const otpResult = await createAndSendOtp({
          email,
          purpose: "REGISTER",
          name,
        });

        return res.status(200).json({
          success: true,
          message: "ส่งรหัส OTP ยืนยันการสมัครสมาชิกไปยัง Email ของคุณแล้ว",
          data: {
            email,
            requireOtp: true,
          },
        });
      }

      return res.status(409).json({
        success: false,
        message: "Email นี้ถูกสมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerified: false,
      },
    });

    // Send 6-digit OTP to user's email
    const otpResult = await createAndSendOtp({
      email: user.email,
      purpose: "REGISTER",
      name: user.name,
    });

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยัง Email ของคุณ",
      requireOtp: true,
      email: user.email,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        requireOtp: true,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email นี้ถูกสมัครสมาชิกแล้ว",
      });
    }
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
    });
  }
}

/**
 * POST /api/auth/verify-register-otp
 * Verify OTP on registration, activate account, and return login JWT.
 */
async function verifyRegisterOtp(req, res) {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Email และรหัส OTP",
      });
    }

    email = String(email).trim().toLowerCase();
    otp = String(otp).trim();

    const verify = await verifyOtp({
      email,
      otp,
      purpose: "REGISTER",
      markUsed: true,
    });

    if (!verify.valid) {
      return res.status(400).json({
        success: false,
        message: verify.message,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบบัญชีผู้ใช้ในระบบ",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Auto-login: generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      appConfig.jwt.secret,
      { expiresIn: appConfig.jwt.expiresIn }
    );

    return res.json({
      success: true,
      message: "ยืนยัน Email สำเร็จ ยินดีต้อนรับสู่ FitAI Trainer!",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: true,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Verify register OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบ OTP",
    });
  }
}

/**
 * POST /api/auth/resend-register-otp
 */
async function resendRegisterOtp(req, res) {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Email",
      });
    }

    email = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Email นี้ในระบบ",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email นี้ได้รับการยืนยันแล้ว สามารถเข้าสู่ระบบได้ทันที",
      });
    }

    const otpResult = await createAndSendOtp({
      email,
      purpose: "REGISTER",
      name: user.name,
    });

    if (otpResult.rateLimited) {
      return res.status(429).json({
        success: false,
        message: otpResult.message,
      });
    }

    return res.json({
      success: true,
      message: "ส่งรหัส OTP ใหม่ไปยัง Email ของคุณเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Resend register OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่",
    });
  }
}

// ============================================
// 2. FORGOT PASSWORD WITH OTP
// ============================================

/**
 * POST /api/auth/forgot-password/send-otp
 * Request OTP for password reset
 */
async function sendForgotPasswordOtp(req, res) {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Email สำหรับรีเซ็ตรหัสผ่าน",
      });
    }

    email = String(email).trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบ Email ไม่ถูกต้อง",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Email นี้ในระบบ FitAI Trainer",
      });
    }

    const otpResult = await createAndSendOtp({
      email,
      purpose: "FORGOT_PASSWORD",
      name: user.name,
    });

    if (otpResult.rateLimited) {
      return res.status(429).json({
        success: false,
        message: otpResult.message,
      });
    }

    return res.json({
      success: true,
      message: "ส่งรหัส OTP 6 หลักสำหรับรีเซ็ตรหัสผ่านไปยัง Email ของคุณแล้ว",
    });
  } catch (error) {
    console.error("Send forgot password OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งรหัส OTP กรุณาลองใหม่อีกครั้ง",
    });
  }
}

/**
 * POST /api/auth/forgot-password/verify-otp
 * Optional step verification
 */
async function verifyForgotPasswordOtp(req, res) {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Email และรหัส OTP",
      });
    }

    email = String(email).trim().toLowerCase();
    otp = String(otp).trim();

    const verify = await verifyOtp({
      email,
      otp,
      purpose: "FORGOT_PASSWORD",
      markUsed: false,
    });

    if (!verify.valid) {
      return res.status(400).json({
        success: false,
        message: verify.message,
      });
    }

    return res.json({
      success: true,
      message: "รหัส OTP ถูกต้อง กรุณากำหนดรหัสผ่านใหม่",
    });
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบ OTP",
    });
  }
}

/**
 * POST /api/auth/forgot-password/reset
 * Set new password using verified OTP
 */
async function resetForgotPassword(req, res) {
  try {
    let { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก Email, รหัส OTP และรหัสผ่านใหม่",
      });
    }

    email = String(email).trim().toLowerCase();
    otp = String(otp).trim();
    newPassword = String(newPassword);

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
      });
    }

    // Verify and consume OTP
    const verify = await verifyOtp({
      email,
      otp,
      purpose: "FORGOT_PASSWORD",
      markUsed: true,
    });

    if (!verify.valid) {
      return res.status(400).json({
        success: false,
        message: verify.message,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้งานนี้ในระบบ",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: true,
      },
    });

    return res.json({
      success: true,
      message: "รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
    });
  } catch (error) {
    console.error("Reset forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน",
    });
  }
}

// ============================================
// 3. CHANGE PASSWORD WITH OTP (LOGGED-IN)
// ============================================

/**
 * POST /api/auth/change-password/request-otp
 */
async function requestChangePasswordOtp(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    const otpResult = await createAndSendOtp({
      email: user.email,
      purpose: "CHANGE_PASSWORD",
      name: user.name,
    });

    if (otpResult.rateLimited) {
      return res.status(429).json({
        success: false,
        message: otpResult.message,
      });
    }

    return res.json({
      success: true,
      message: `ส่งรหัส OTP ไปยัง Email (${user.email}) เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error("Request change password OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่",
    });
  }
}

/**
 * POST /api/auth/change-password/confirm
 */
async function confirmChangePassword(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let { currentPassword, newPassword, otp } = req.body;

    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกรหัสผ่านปัจจุบัน, รหัสผ่านใหม่ และรหัส OTP",
      });
    }

    currentPassword = String(currentPassword);
    newPassword = String(newPassword);
    otp = String(otp).trim();

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    const matchCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matchCurrent) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      });
    }

    const verify = await verifyOtp({
      email: user.email,
      otp,
      purpose: "CHANGE_PASSWORD",
      markUsed: true,
    });

    if (!verify.valid) {
      return res.status(400).json({
        success: false,
        message: verify.message,
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return res.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Confirm change password error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    });
  }
}

// ============================================
// 4. LOGIN & LEGACY VERIFICATION
// ============================================

async function login(req, res) {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก Email และ Password",
      });
    }

    email = String(email).trim().toLowerCase();
    password = String(password);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบ Email ไม่ถูกต้อง",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email หรือ Password ไม่ถูกต้อง",
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Email หรือ Password ไม่ถูกต้อง",
      });
    }

    if (!appConfig.jwt.secret) {
      return res.status(500).json({
        success: false,
        message: "ระบบ Authentication ยังไม่ได้ตั้งค่า JWT_SECRET",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      appConfig.jwt.secret,
      { expiresIn: appConfig.jwt.expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในระบบ",
    });
  }
}

async function createEmailVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  return await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt },
  });
}

async function verifyEmail(req, res) {
  try {
    const { token, email, otp } = req.query;

    // Check if verification is by OTP query
    if (email && otp) {
      const verify = await verifyOtp({
        email: String(email).trim().toLowerCase(),
        otp: String(otp).trim(),
        purpose: "REGISTER",
        markUsed: true,
      });

      if (!verify.valid) {
        return res.status(400).json({ success: false, message: verify.message });
      }

      const user = await prisma.user.update({
        where: { email: String(email).trim().toLowerCase() },
        data: { emailVerified: true },
      });

      return res.json({
        success: true,
        message: "ยืนยัน Email สำเร็จ",
        data: { id: user.id, name: user.name, email: user.email, emailVerified: true },
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: "Verification token ไม่ถูกต้องหรือหมดอายุ",
      });
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
      return res.status(400).json({
        success: false,
        message: "Verification token หมดอายุแล้ว",
      });
    }

    const user = await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });

    return res.json({
      success: true,
      message: "ยืนยัน Email สำเร็จ",
      data: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยืนยัน Email",
    });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ Email",
      });
    }

    email = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบ Email นี้ในระบบ",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email นี้ได้รับการยืนยันแล้ว",
      });
    }

    // Send OTP for Register
    const otpResult = await createAndSendOtp({
      email,
      purpose: "REGISTER",
      name: user.name,
    });

    return res.json({
      success: true,
      message: "ส่งรหัส OTP ยืนยันอีกครั้งเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      message: "ไม่สามารถส่ง Email ยืนยันได้",
    });
  }
}

module.exports = {
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
};
