const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const { aiConfig } = require("../config");

// Resend client if API key configured
const resend = aiConfig.email.apiKey ? new Resend(aiConfig.email.apiKey) : null;

// SMTP Transport helper (supports Gmail with App Password and standard SMTP)
let cachedTransporter = null;
function getSmtpTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
  if (!user || !rawPass) return null;

  const pass = String(rawPass).replace(/\s+/g, "").trim();
  const cleanUser = String(user).trim();

  if (
    process.env.SMTP_SERVICE === "gmail" ||
    cleanUser.toLowerCase().endsWith("@gmail.com") ||
    process.env.SMTP_HOST === "smtp.gmail.com"
  ) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanUser,
        pass,
      },
    });
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === "true",
    auth: {
      user: cleanUser,
      pass,
    },
  });
  return cachedTransporter;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Send 6-digit OTP Email for Registration, Forgot Password, or Change Password.
 */
async function sendOtpEmail({ email, name = "", otp, purpose = "REGISTER" }) {
  let subject = `รหัสยืนยัน OTP: ${otp} - FitAI Trainer`;
  let title = "รหัสยืนยัน OTP";
  let description = "นี่คือรหัสยืนยันสำหรับดำเนินการในระบบ FitAI Trainer";

  if (purpose === "REGISTER") {
    subject = `รหัสยืนยันการสมัครสมาชิก (OTP: ${otp}) - FitAI Trainer`;
    title = "ยืนยันการสมัครสมาชิก FitAI Trainer";
    description = "ขอบคุณที่สมัครสมาชิก FitAI Trainer กรุณาใช้รหัส OTP 6 หลักด้านล่างนี้เพื่อเปิดใช้งานบัญชีของคุณ:";
  } else if (purpose === "FORGOT_PASSWORD") {
    subject = `รหัสรีเซ็ตรหัสผ่าน (OTP: ${otp}) - FitAI Trainer`;
    title = "คำขอรีเซ็ตรหัสผ่าน";
    description = "เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี FitAI Trainer ของคุณ กรุณาใช้รหัส OTP 6 หลักด้านล่างนี้เพื่อตั้งรหัสผ่านใหม่:";
  } else if (purpose === "CHANGE_PASSWORD") {
    subject = `รหัสยืนยันการเปลี่ยนรหัสผ่าน (OTP: ${otp}) - FitAI Trainer`;
    title = "คำขอเปลี่ยนรหัสผ่านบัญชี";
    description = "มีการร้องขอเปลี่ยนรหัสผ่านบัญชีของคุณ กรุณาใช้รหัส OTP ด้านล่างเพื่อยืนยันความปลอดภัยก่อนเปลี่ยนรหัสผ่าน:";
  }

  const safeName = name ? escapeHtml(name) : "คุณ";

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#edf1f4; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:540px; margin:32px auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 12px 36px rgba(30, 41, 59, 0.08); border:1px solid #c4d7e6;">
    <div style="padding:32px 24px; text-align:center; background:#1e293b; color:#ffffff;">
      <h1 style="margin:0; font-size:26px; font-weight:800; letter-spacing:-0.5px; color:#ffffff;">
        FitAI Trainer
      </h1>
      <p style="margin:6px 0 0; font-size:13px; color:#abbed2; font-weight:500;">
        Smart AI Fitness & Nutrition Platform
      </p>
    </div>

    <div style="padding:36px 32px; text-align:center;">
      <h2 style="margin:0 0 12px; color:#1e293b; font-size:20px; font-weight:700;">
        ${title}
      </h2>
      <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
        สวัสดี ${safeName}<br/>
        ${description}
      </p>

      <div style="margin:28px 0; padding:20px 16px; background:#edf1f4; border-radius:16px; border:2px dashed #abbed2; display:inline-block; min-width:260px;">
        <span style="font-size:36px; font-weight:900; letter-spacing:10px; color:#3b99e2; font-family:monospace; display:block;">
          ${otp}
        </span>
      </div>

      <p style="margin:16px 0 0; color:#64748b; font-size:13px; font-weight:500;">
        รหัส OTP นี้มีอายุการใช้งาน <strong>10 นาที</strong>
      </p>
      <p style="margin:8px 0 0; color:#94a3b8; font-size:12px; line-height:1.5;">
        เพื่อความปลอดภัย กรุณาอย่าแชร์รหัสนี้ให้ผู้อื่นเด็ดขาด
      </p>

      <hr style="border:none; border-top:1px solid #edf1f4; margin:32px 0 20px;" />

      <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.6;">
        หากคุณไม่ได้เป็นผู้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้ บัญชีของคุณจะยังคงปลอดภัยครับ
      </p>
    </div>
  </div>
</body>
</html>
  `;

  console.log("==========================================================");
  console.log(`[EMAIL OTP SERVICE] -> ${email}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: [ ${otp} ]`);
  console.log("==========================================================");

  // 1. Try SMTP/Gmail if configured
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const from = process.env.EMAIL_FROM || `FitAI Trainer <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });
      console.log(`[EMAIL OTP SENT VIA GMAIL/SMTP] Message ID: ${info.messageId} to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      console.error("[SMTP Error]:", smtpErr.message);
    }
  }

  // 2. Try Resend if configured
  if (resend) {
    try {
      const from = aiConfig.email.from || "FitAI Trainer <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from,
        to: [email],
        subject,
        html,
      });
      if (error) {
        console.error("Resend send error:", error);
      } else {
        return { success: true, data };
      }
    } catch (resendErr) {
      console.error("Resend exception:", resendErr.message);
    }
  }

  // Fallback dev mode (ensures local testing never crashes)
  return {
    success: true,
    development: true,
    otp,
  };
}

/**
 * Send Verification URL Email (kept for backward compatibility)
 */
async function sendVerificationEmail({ email, name, verificationUrl }) {
  if (!resend && !getSmtpTransporter()) {
    console.log("====================================");
    console.log("EMAIL SERVICE: Neither Resend nor SMTP configured");
    console.log("Verification URL:", verificationUrl);
    console.log("====================================");
    return { success: true, development: true };
  }

  const subject = "ยืนยัน Email ของคุณ - FitAI Trainer";
  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0; padding:20px; background:#edf1f4; font-family:sans-serif;">
      <div style="max-width:540px; margin:auto; background:#ffffff; border-radius:16px; padding:32px; text-align:center;">
        <h2>สวัสดี ${escapeHtml(name)}</h2>
        <p>กรุณากดยืนยัน Email เพื่อเปิดใช้งานบัญชี FitAI Trainer ของคุณ</p>
        <a href="${verificationUrl}" style="display:inline-block; padding:14px 28px; background:#1e293b; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; margin:20px 0;">ยืนยัน Email</a>
        <p style="color:#64748b; font-size:12px;">ลิงก์จะหมดอายุภายใน 30 นาที</p>
      </div>
    </body>
    </html>
  `;

  const verTransporter = getSmtpTransporter();
  if (verTransporter) {
    try {
      const from = process.env.EMAIL_FROM || `FitAI Trainer <${process.env.SMTP_USER}>`;
      await verTransporter.sendMail({ from, to: email, subject, html });
      return { success: true };
    } catch (e) {
      console.error("SMTP error:", e.message);
    }
  }

  if (resend) {
    const from = aiConfig.email.from || "FitAI Trainer <onboarding@resend.dev>";
    const { data, error } = await resend.emails.send({ from, to: [email], subject, html });
    if (error) console.error("Resend error:", error);
    return { success: !error, data };
  }

  return { success: true, development: true };
}

module.exports = {
  sendOtpEmail,
  sendVerificationEmail,
  escapeHtml,
};
