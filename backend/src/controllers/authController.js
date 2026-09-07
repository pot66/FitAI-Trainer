const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../services/prisma");
const crypto = require("crypto");
const { appConfig } = require("../config");

const {
  sendVerificationEmail,
} = require("../services/emailService");

// ============================================
// Email Validation
// ============================================



function isValidEmail(email) {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

// ============================================
// Register
// ============================================

async function register(req, res) {
  try {
    let {
      name,
      email,
      password,
    } = req.body;

    // ----------------------------------------
    // ตรวจข้อมูล
    // ----------------------------------------

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "กรุณากรอกชื่อ Email และ Password",
      });
    }

    // ----------------------------------------
    // Clean Data
    // ----------------------------------------

    name = String(name).trim();

    email = String(email)
      .trim()
      .toLowerCase();

    password = String(password);

    // ----------------------------------------
    // Validate Name
    // ----------------------------------------

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "ชื่อยาวเกินไป",
      });
    }

    // ----------------------------------------
    // Validate Email
    // ----------------------------------------

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "รูปแบบ Email ไม่ถูกต้อง",
      });
    }

    // ----------------------------------------
    // Validate Password
    // ----------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password ต้องมีอย่างน้อย 8 ตัวอักษร",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message:
          "Password ยาวเกินไป",
      });
    }

    // ----------------------------------------
    // ตรวจ Email ซ้ำ
    // ----------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Email นี้ถูกสมัครสมาชิกแล้ว",
      });
    }

    // ----------------------------------------
    // Hash Password
    // ----------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // ----------------------------------------
    // Create User
    // ----------------------------------------

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });
const verificationToken =
  await createEmailVerificationToken(
    user.id
  );

const frontendUrl = appConfig.frontendUrl;

const verificationUrl =
  `${frontendUrl}/verify-email?token=${verificationToken.token}`;

    // A mail-provider outage must not turn a successfully-created account
    // into a failed registration response.
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationUrl,
      });
    } catch (emailError) {
      console.error("Verification email could not be sent:", emailError);
    }
    // ----------------------------------------
    // Response
    // ----------------------------------------

    return res.status(201).json({
  success: true,
  message:
    "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบ Email เพื่อยืนยันบัญชี",
  data: {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified:
      user.emailVerified,
  },
});
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    // Prisma duplicate error
    if (
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Email นี้ถูกสมัครสมาชิกแล้ว",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "เกิดข้อผิดพลาดภายในระบบ",
    });
  }
}

// ============================================
// Login
// ============================================

async function login(req, res) {
  try {
    let {
      email,
      password,
    } = req.body;

    // ----------------------------------------
    // ตรวจข้อมูล
    // ----------------------------------------

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "กรุณากรอก Email และ Password",
      });
    }

    // ----------------------------------------
    // Clean Data
    // ----------------------------------------

    email = String(email)
      .trim()
      .toLowerCase();

    password = String(password);

    // ----------------------------------------
    // Validate Email
    // ----------------------------------------

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "รูปแบบ Email ไม่ถูกต้อง",
      });
    }

    // ----------------------------------------
    // Find User
    // ----------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Email หรือ Password ไม่ถูกต้อง",
      });
    }

    // ----------------------------------------
    // Compare Password
    // ----------------------------------------

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Email หรือ Password ไม่ถูกต้อง",
      });
    }

    // ----------------------------------------
    // Create JWT
    // ----------------------------------------

    if (!appConfig.jwt.secret) {
      console.error(
        "JWT_SECRET is missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "ระบบ Authentication ยังไม่ได้ตั้งค่า JWT_SECRET",
      });
    }

    const token =
      jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        appConfig.jwt.secret,
        {
          expiresIn:
            appConfig.jwt.expiresIn,
        }
      );

    // ----------------------------------------
    // Response
    // ----------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "เข้าสู่ระบบสำเร็จ",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "เกิดข้อผิดพลาดภายในระบบ",
    });
  }
}

async function createEmailVerificationToken(
  userId
) {
  const token =
    crypto.randomBytes(32).toString("hex");

  const expiresAt =
    new Date(
      Date.now() +
        30 * 60 * 1000
    );

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
    },
  });

  const verificationToken =
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

  return verificationToken;
}

async function verifyEmail(req, res) {
  try {
    const { token } =
      req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Verification token is required",
      });
    }

    const verificationToken =
      await prisma.emailVerificationToken.findUnique({
        where: {
          token,
        },
      });

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message:
          "Verification token ไม่ถูกต้องหรือหมดอายุ",
      });
    }

    if (
      verificationToken.expiresAt <
      new Date()
    ) {
      await prisma.emailVerificationToken.delete({
        where: {
          id:
            verificationToken.id,
        },
      });

      return res.status(400).json({
        success: false,
        message:
          "Verification token หมดอายุแล้ว",
      });
    }

    const user =
      await prisma.user.update({
        where: {
          id:
            verificationToken.userId,
        },

        data: {
          emailVerified: true,
        },
      });

    await prisma.emailVerificationToken.delete({
      where: {
        id:
          verificationToken.id,
      },
    });

    return res.json({
      success: true,
      message:
        "ยืนยัน Email สำเร็จ",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified:
          user.emailVerified,
      },
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "เกิดข้อผิดพลาดในการยืนยัน Email",
    });
  }
}

async function resendVerificationEmail(
  req,
  res
) {
  try {
    let { email } =
      req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "กรุณาระบุ Email",
      });
    }

    email = String(email)
      .trim()
      .toLowerCase();

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "ไม่พบ Email นี้ในระบบ",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email นี้ได้รับการยืนยันแล้ว",
      });
    }

    const verificationToken =
      await createEmailVerificationToken(
        user.id
      );

    const frontendUrl = appConfig.frontendUrl;

    const verificationUrl =
      `${frontendUrl}/verify-email?token=${verificationToken.token}`;

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl,
    });

    return res.json({
      success: true,
      message:
        "ส่ง Email ยืนยันอีกครั้งแล้ว",
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "ไม่สามารถส่ง Email ยืนยันได้",
    });
  }
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
};
