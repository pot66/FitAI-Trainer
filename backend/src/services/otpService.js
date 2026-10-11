const prisma = require("./prisma");
const { sendOtpEmail } = require("./emailService");

function generateOtp(length = 6) {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * ลบ OTP ทั้งหมดที่หมดอายุแล้วออกจากฐานข้อมูล (expiresAt <= new Date())
 * @param {string|null} email - หากระบุจะลบเฉพาะของ Email นั้น หากไม่ระบุจะลบทุกรายการที่หมดอายุในระบบ
 */
async function cleanupExpiredOtps(email = null) {
  try {
    const where = { expiresAt: { lte: new Date() } };
    if (email) {
      where.email = String(email).trim().toLowerCase();
    }
    const result = await prisma.otpVerification.deleteMany({ where });
    if (result && result.count > 0) {
      console.log(`[OTP] ลบรหัส OTP ที่หมดอายุแล้วจำนวน ${result.count} รายการ${email ? ` (สำหรับ ${email})` : ""}`);
    }
    return result;
  } catch (err) {
    console.error("[OTP] เกิดข้อผิดพลาดในการลบ OTP ที่หมดอายุ:", err.message);
    return { count: 0 };
  }
}

/**
 * ลบรหัส OTP ของ Email และ Purpose ที่ระบุออกจากฐานข้อมูลทันที
 */
async function deleteOtp({ email, purpose = null }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return { count: 0 };
  try {
    const where = { email: cleanEmail };
    if (purpose) {
      where.purpose = purpose;
    }
    const result = await prisma.otpVerification.deleteMany({ where });
    if (result && result.count > 0) {
      console.log(`[OTP] ลบรหัส OTP ของ ${cleanEmail} (${purpose || "ทั้งหมด"}) จำนวน ${result.count} รายการ`);
    }
    return result;
  } catch (err) {
    console.error("[OTP] เกิดข้อผิดพลาดในการลบ OTP:", err.message);
    return { count: 0 };
  }
}

/**
 * Create and send OTP to email.
 * Includes rate limit (45s), cleans up expired OTPs, and deletes prior OTPs.
 */
async function createAndSendOtp({ email, purpose, name = null }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Email is required");
  }

  // 1. ทำการลบรหัส OTP ที่หมดอายุแล้วออกทันที
  await cleanupExpiredOtps(cleanEmail);

  // 2. ตรวจสอบ Rate limit: 45 วินาที
  const recent = await prisma.otpVerification.findFirst({
    where: {
      email: cleanEmail,
      purpose,
      createdAt: { gt: new Date(Date.now() - 45 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    return {
      success: false,
      rateLimited: true,
      message: "กรุณารอ 45 วินาทีก่อนขอรหัส OTP ใหม่อีกครั้ง",
    };
  }

  // 3. ลบรหัส OTP เดิมที่ค้างอยู่ของ Email และ Purpose นี้ออกก่อนสร้างรหัสใหม่
  await deleteOtp({ email: cleanEmail, purpose });

  // 4. สร้างรหัส OTP ใหม่ 6 หลัก มีอายุ 10 นาที
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpVerification.create({
    data: {
      email: cleanEmail,
      otp,
      purpose,
      expiresAt,
    },
  });

  // 5. ส่ง Email แจ้งรหัส OTP
  const sendResult = await sendOtpEmail({
    email: cleanEmail,
    name,
    otp,
    purpose,
  });

  return {
    success: true,
    message: "ส่งรหัส OTP เรียบร้อยแล้ว กรุณาตรวจสอบ Email ของคุณ",
    expiresAt,
    devOtp: sendResult?.development ? otp : undefined,
  };
}

/**
 * Verify OTP code
 * เมื่อผู้ใช้ใส่รหัสแล้ว (markUsed = true) หรือรหัสหมดอายุ ให้ลบออกจากฐานข้อมูลทันที
 */
async function verifyOtp({ email, otp, purpose, markUsed = true }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanOtp = String(otp || "").trim();

  if (!cleanEmail || !cleanOtp) {
    return { valid: false, message: "กรุณาระบุ Email และรหัส OTP" };
  }

  // 1. ลบรหัส OTP ที่หมดอายุแล้วออกก่อนตรวจสอบ
  await cleanupExpiredOtps(cleanEmail);

  // 2. ค้นหารหัส OTP ที่ตรงกับ Email, Purpose และยังไม่หมดอายุ
  const record = await prisma.otpVerification.findFirst({
    where: {
      email: cleanEmail,
      otp: cleanOtp,
      purpose,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. ถ้ารหัสไม่ถูกต้อง หรือหมดอายุ (ถูกลบไปแล้ว)
  if (!record) {
    // ล้าง OTP ที่อาจหมดอายุตกค้างเพิ่มเติม
    await cleanupExpiredOtps(cleanEmail);
    return {
      valid: false,
      message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาตรวจสอบหรือขอรหัสใหม่",
    };
  }

  // 4. เมื่อผู้ใช้ใส่รหัส OTP แล้ว (markUsed = true) ให้ลบรหัส OTP ออกจากฐานข้อมูลทันที!
  if (markUsed) {
    try {
      await prisma.otpVerification.delete({
        where: { id: record.id },
      });
    } catch {
      // ป้องกันกรณีถูกลบไปก่อนหน้า
      await deleteOtp({ email: cleanEmail, purpose });
    }

    // ลบรหัสอื่นๆ ที่อาจค้างอยู่ของ Purpose นี้ออกด้วย
    await deleteOtp({ email: cleanEmail, purpose });
    console.log(`[OTP] ลบรหัส OTP เรียบร้อยแล้วหลังผู้ใช้ยืนยันสำเร็จ (${cleanEmail} - ${purpose})`);
  }

  return { valid: true, record };
}

// ล้าง OTP ที่หมดอายุทันทีเมื่อ Service เริ่มทำงาน
cleanupExpiredOtps().catch(() => {});

// ตั้งเวลาลบ OTP ที่หมดอายุแบบอัตโนมัติในเบื้องหลังทุก 5 นาที (unref เพื่อไม่บล็อก shutdown)
const cleanupInterval = setInterval(() => {
  cleanupExpiredOtps().catch(() => {});
}, 5 * 60 * 1000);
if (cleanupInterval && typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}

module.exports = {
  generateOtp,
  cleanupExpiredOtps,
  deleteOtp,
  createAndSendOtp,
  verifyOtp,
};
