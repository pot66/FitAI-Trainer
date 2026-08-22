const { Resend } = require("resend");

const resend =
  process.env.RESEND_API_KEY
    ? new Resend(
        process.env.RESEND_API_KEY
      )
    : null;

async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
}) {
  // ============================================
  // Development Mode
  // ============================================

  if (!resend) {
    console.log(
      "===================================="
    );

    console.log(
      "EMAIL SERVICE: RESEND_API_KEY not configured"
    );

    console.log(
      "Verification URL:"
    );

    console.log(
      verificationUrl
    );

    console.log(
      "===================================="
    );

    return {
      success: true,
      development: true,
    };
  }

  // ============================================
  // Send Email
  // ============================================

  const from =
    process.env.EMAIL_FROM ||
    "FitAI Trainer <onboarding@resend.dev>";

  const { data, error } =
    await resend.emails.send({
      from,
      to: [email],
      subject:
        "ยืนยัน Email ของคุณ - FitAI Trainer",

      html: `
        <!DOCTYPE html>

        <html lang="th">

        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f7fb;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);
            "
          >

            <div
              style="
                padding:32px;
                text-align:center;
                background:#111827;
                color:#ffffff;
              "
            >

              <h1
                style="
                  margin:0;
                  font-size:30px;
                "
              >
                FitAI Trainer
              </h1>

              <p
                style="
                  margin:10px 0 0;
                  opacity:0.8;
                "
              >
                AI Fitness Assistant
              </p>

            </div>

            <div
              style="
                padding:40px 32px;
              "
            >

              <h2
                style="
                  color:#111827;
                "
              >
                สวัสดี ${escapeHtml(name)} 👋
              </h2>

              <p
                style="
                  color:#4b5563;
                  line-height:1.7;
                "
              >
                ขอบคุณที่สมัครสมาชิก
                FitAI Trainer
              </p>

              <p
                style="
                  color:#4b5563;
                  line-height:1.7;
                "
              >
                กรุณากดยืนยัน Email
                เพื่อเปิดใช้งานบัญชีของคุณ
              </p>

              <div
                style="
                  text-align:center;
                  margin:32px 0;
                "
              >

                <a
                  href="${verificationUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#111827;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:10px;
                    font-weight:bold;
                  "
                >
                  ยืนยัน Email
                </a>

              </div>

              <p
                style="
                  color:#6b7280;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                ลิงก์นี้จะหมดอายุภายใน
                30 นาที
              </p>

              <hr
                style="
                  border:none;
                  border-top:1px solid #e5e7eb;
                  margin:30px 0;
                "
              />

              <p
                style="
                  color:#9ca3af;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                หากคุณไม่ได้สมัครสมาชิก
                FitAI Trainer
                สามารถเพิกเฉยต่อ Email นี้ได้
              </p>

            </div>

          </div>

        </body>

        </html>
      `,
    });

  if (error) {
    console.error(
      "Resend email error:",
      error
    );

    throw new Error(
      "ไม่สามารถส่ง Email ได้"
    );
  }

  return {
    success: true,
    data,
  };
}

// ============================================
// HTML Escape
// ============================================

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = {
  sendVerificationEmail,
};