import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";

function VerifyEmail() {
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "manual_otp"
  const [message, setMessage] = useState("กำลังตรวจสอบการยืนยัน Email...");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("manual_otp");
      setMessage("กรอกรหัส OTP 6 หลักที่ได้รับทางอีเมล เพื่อเปิดใช้งานบัญชี");
      return;
    }

    api
      .get("/auth/verify-email", { params: { token } })
      .then((response) => {
        setStatus(response.data?.success ? "success" : "error");
        setMessage(response.data?.message || "ยินดีด้วย ยืนยัน Email สำเร็จแล้ว");
      })
      .catch((error) => {
        setStatus("manual_otp");
        setMessage(
          error.response?.data?.message || "ลิงก์หมดอายุหรือเปิดไม่ได้ คุณสามารถกรอกรหัส OTP ด้วยตนเองได้ที่นี่"
        );
      });
  }, []);

  const handleManualVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setOtpError("กรุณากรอกอีเมล");
      return;
    }

    if (cleanOtp.length !== 6) {
      setOtpError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/verify-register-otp", {
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (res.data?.success) {
        setStatus("success");
        setMessage("ยินดีด้วย ยืนยัน Email สำเร็จแล้ว!");
      } else {
        setOtpError(res.data?.message || "รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
      }
    } catch (err) {
      console.error("Manual verify OTP error:", err);
      setOtpError(
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดในการยืนยัน OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#abbed2] rounded-[32px] p-4 sm:p-5 shadow-xl flex flex-col items-center border border-white/20">
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0e1e38] flex items-center justify-center shadow-md overflow-hidden p-1 mb-2 border border-white/20">
            <img src="/ai-trainer-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-wider">FitAI Trainer</span>
        </div>

        {/* Inner White Card */}
        <div className="w-full bg-white rounded-[26px] p-6 sm:p-8 shadow-sm flex flex-col items-center text-center">
          <h1 className="text-2xl font-black text-[#1e293b] mb-2 tracking-tight">
            Email Verification
          </h1>

          <p className="text-[#64748b] text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {status === "loading" && (
            <div className="w-8 h-8 border-3 border-[#3b99e2] border-t-transparent rounded-full animate-spin mb-4" />
          )}

          {status === "manual_otp" && (
            <form onSubmit={handleManualVerifyOtp} className="w-full flex flex-col gap-3 text-left">
              <div>
                <label className="text-xs font-semibold text-[#334155] mb-1 block">
                  Email ที่ลงทะเบียน
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full bg-[#c4d7e6] text-sm text-[#1e293b] px-3.5 py-2.5 rounded-xl placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b99e2]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] mb-1 block">
                  รหัส OTP 6 หลัก
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  required
                  disabled={loading}
                  className="w-full bg-[#c4d7e6] font-mono text-center text-xl font-bold tracking-[0.3em] text-[#1e293b] px-3.5 py-2.5 rounded-xl placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b99e2]"
                />
              </div>

              {otpError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                  <span>✅</span>
                  <span>{otpSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || !email}
                className="w-full py-3.5 mt-2 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
              </button>
            </form>
          )}

          {status !== "loading" && (
            <button
              type="button"
              className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-[#1e293b] font-bold rounded-2xl text-sm transition-all cursor-pointer"
              onClick={() => navigate("/login")}
            >
              ไปที่หน้าเข้าสู่ระบบ (Login)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
