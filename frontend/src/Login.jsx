import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";
import api from "./services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Mode: "login" | "forgot_request" | "forgot_reset"
  const [mode, setMode] = useState("login");

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer for Forgot Password OTP
  useEffect(() => {
    let timer = null;
    if (mode === "forgot_reset" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, countdown]);

  // Handle standard Login
  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await login(cleanEmail, password);
      if (!result.success) {
        setError(result.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Forgot Password: Send OTP to email
  const handleRequestForgotOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = (forgotEmail || email).trim().toLowerCase();
    if (!cleanEmail) {
      setError("กรุณากรอกอีเมลของคุณ");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password/send-otp", {
        email: cleanEmail,
      });

      if (res.data?.success) {
        setForgotEmail(cleanEmail);
        setMode("forgot_reset");
        setCountdown(60);
        setSuccess("ส่งรหัส OTP เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ");
      } else {
        setError(res.data?.message || "ไม่สามารถส่งรหัส OTP ได้");
      }
    } catch (err) {
      console.error("Forgot OTP Error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดในการส่งรหัส OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of Forgot Password: Reset password with OTP
  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password/reset", {
        email: forgotEmail,
        otp: cleanOtp,
        newPassword,
        confirmPassword: confirmNewPassword,
      });

      if (res.data?.success) {
        setSuccess("เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังกลับไปหน้าเข้าสู่ระบบ...");
        setTimeout(() => {
          setMode("login");
          setPassword("");
          setOtp("");
          setNewPassword("");
          setConfirmNewPassword("");
          setSuccess("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
        }, 1500);
      } else {
        setError(res.data?.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน"
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    if (countdown > 0 || resending) return;
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await api.post("/auth/forgot-password/send-otp", {
        email: forgotEmail,
      });
      if (res.data?.success) {
        setSuccess("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว");
        setCountdown(60);
      } else {
        setError(res.data?.message || "ไม่สามารถส่งรหัสใหม่ได้");
      }
    } catch (err) {
      console.error("Resend Forgot OTP Error:", err);
      setError("เกิดข้อผิดพลาดในการส่งรหัส OTP");
    } finally {
      setResending(false);
    }
  };

  const switchToLogin = () => {
    setMode("login");
    setError("");
    setSuccess("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-screen bg-[#edf1f4] flex items-center justify-center p-3 sm:p-4">
      {/* Outer Shell Card */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] bg-[#abbed2] rounded-[32px] pt-7 pb-4 px-3 shadow-2xl flex flex-col items-center relative border border-white/20">
        
        {/* Header Title */}
        <h1 className="text-xl font-medium text-[#1e293b] tracking-normal mb-3">
          Ai Trainer
        </h1>

        {/* AI Robot Logo */}
        <div className="w-[92px] h-[92px] rounded-2xl bg-[#0e1e38] shadow-md overflow-hidden flex items-center justify-center mb-4 p-0.5 border border-white/20">
          <img
            src="/ai-trainer-logo.png"
            alt="Ai Trainer"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Inner White Form Card */}
        <div className="w-full bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-6 shadow-sm flex flex-col">
          {/* ======================================================== */}
          {/* 1. LOGIN MODE                                            */}
          {/* ======================================================== */}
          {mode === "login" && (
            <>
              <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
                Sign in
              </h2>

              <form className="w-full flex flex-col" onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="flex flex-col mb-3">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <svg
                      className="w-4 h-4 text-[#475569] mr-2.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col mb-1.5">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    Password
                  </label>
                  <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <svg
                      className="w-4 h-4 text-[#475569] mr-2.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="mt-1 mb-4 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setMode("forgot_request");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-[11px] text-[#3b99e2] hover:text-[#288ad4] hover:underline font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                    <span>✅</span>
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>LOGGING IN...</span>
                    </>
                  ) : (
                    "LOGIN"
                  )}
                </button>
              </form>

              {/* Footer Register Link */}
              <div className="text-center text-xs text-[#64748b] mt-4">
                <span>Don't have an account?</span>{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  disabled={loading}
                  className="font-bold text-[#1e293b] hover:text-[#3b99e2] bg-transparent border-0 cursor-pointer disabled:opacity-50 transition-colors uppercase ml-1"
                >
                  REGISTER
                </button>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 2. FORGOT PASSWORD - STEP 1: REQUEST OTP                 */}
          {/* ======================================================== */}
          {mode === "forgot_request" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-[#1e293b]">
                  ลืมรหัสผ่าน
                </h2>
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="text-xs text-[#64748b] hover:text-[#1e293b] underline cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </div>

              <p className="text-xs text-[#64748b] mb-4 leading-relaxed">
                กรุณากรอกอีเมลของคุณเพื่อรับรหัส OTP 6 หลักสำหรับใช้รีเซ็ตรหัสผ่าน
              </p>

              <form className="w-full flex flex-col" onSubmit={handleRequestForgotOtp}>
                <div className="flex flex-col mb-4">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <svg
                      className="w-4 h-4 text-[#475569] mr-2.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Request Button */}
                <button
                  type="submit"
                  disabled={loading || !forgotEmail}
                  className="w-full py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>กำลังส่ง OTP...</span>
                    </>
                  ) : (
                    "ขอรหัส OTP"
                  )}
                </button>

                <div className="text-center text-xs text-[#64748b] mt-4">
                  <button
                    type="button"
                    onClick={switchToLogin}
                    disabled={loading}
                    className="font-medium text-[#64748b] hover:text-[#1e293b] bg-transparent border-0 cursor-pointer transition-colors"
                  >
                    ← กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ======================================================== */}
          {/* 3. FORGOT PASSWORD - STEP 2: VERIFY OTP & RESET PASSWORD */}
          {/* ======================================================== */}
          {mode === "forgot_reset" && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-[#1e293b]">
                  ตั้งรหัสผ่านใหม่
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot_request");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-xs text-[#64748b] hover:text-[#1e293b] underline cursor-pointer"
                >
                  เปลี่ยน Email
                </button>
              </div>

              <p className="text-xs text-[#64748b] mb-3 leading-relaxed">
                กรอกรหัส OTP 6 หลักที่ส่งไปที่{" "}
                <span className="font-semibold text-[#1e293b] break-all">{forgotEmail}</span>{" "}
                และกำหนดรหัสผ่านใหม่
              </p>

              

              <form className="w-full flex flex-col" onSubmit={handleResetPassword}>
                {/* OTP Field */}
                <div className="flex flex-col mb-3">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5 text-center">
                    รหัส OTP 6 หลัก
                  </label>
                  <div className="relative flex items-center justify-center bg-[#c4d7e6] rounded-xl px-3.5 py-2 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="••••••"
                      autoFocus
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-center font-mono text-xl font-bold tracking-[0.3em] text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* New Password Field */}
                <div className="flex flex-col mb-3">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    รหัสผ่านใหม่
                  </label>
                  <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <svg
                      className="w-4 h-4 text-[#475569] mr-2.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="flex flex-col mb-4">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <svg
                      className="w-4 h-4 text-[#475569] mr-2.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                    >
                      {showConfirmNewPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                    <span>✅</span>
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || !newPassword || !confirmNewPassword}
                  className="w-full py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>กำลังเปลี่ยนรหัสผ่าน...</span>
                    </>
                  ) : (
                    "บันทึกรหัสผ่านใหม่"
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center text-xs text-[#64748b] mt-4 flex items-center justify-center gap-1.5">
                  <span>ไม่ได้รับรหัส?</span>
                  <button
                    type="button"
                    disabled={countdown > 0 || resending}
                    onClick={handleResendForgotOtp}
                    className="font-bold text-[#3b99e2] hover:text-[#288ad4] disabled:text-[#94a3b8] bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {resending
                      ? "กำลังส่ง..."
                      : countdown > 0
                      ? `ส่งรหัสใหม่ (${countdown}s)`
                      : "ขอรหัส OTP ใหม่"}
                  </button>
                </div>

                <div className="text-center text-xs text-[#64748b] mt-3">
                  <button
                    type="button"
                    onClick={switchToLogin}
                    disabled={loading}
                    className="font-medium text-[#64748b] hover:text-[#1e293b] bg-transparent border-0 cursor-pointer transition-colors"
                  >
                    ← ยกเลิก / กลับไปเข้าสู่ระบบ
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
