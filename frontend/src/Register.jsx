import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";

function Register({ onBack }) {
  const navigate = useNavigate();
  const { register, verifyRegisterOtp, resendRegisterOtp } = useAuth();

  // Step state: "register" | "otp"
  const [step, setStep] = useState("register");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  // Loading & Message states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer = null;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/login");
    }
  };

  // Submit Registration Form
  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    if (!cleanEmail) {
      setError("กรุณากรอก Email");
      return;
    }

    if (password.length < 6) {
      setError("Password ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const result = await register(cleanName, cleanEmail, password);

      if (!result.success) {
        setError(result.message || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      if (result.requireOtp) {
        setRegisteredEmail(result.email || cleanEmail);
        setStep("otp");
        setCountdown(60);
        setSuccess("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว กรุณากรอกรหัส 6 หลักด้านล่าง");
      } else {
        setSuccess("สมัครสมาชิกสำเร็จ!");
        setTimeout(() => {
          navigate("/onboarding");
        }, 1000);
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyRegisterOtp(registeredEmail, cleanOtp);

      if (!result.success) {
        setError(result.message || "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว");
        return;
      }

      setSuccess("ยืนยันอีเมลสำเร็จแล้ว! กำลังเข้าสู่ระบบ...");
      setTimeout(() => {
        navigate("/onboarding");
      }, 1000);
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการยืนยัน OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const result = await resendRegisterOtp(registeredEmail);
      if (result.success) {
        setSuccess("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว");
        setCountdown(60);
      } else {
        setError(result.message || "ไม่สามารถส่งรหัสใหม่ได้");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setError("เกิดข้อผิดพลาดในการส่งรหัส OTP");
    } finally {
      setResending(false);
    }
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
          {step === "register" ? (
            <>
              <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
                Register
              </h2>

              <form className="w-full flex flex-col" onSubmit={handleRegister}>
                {/* Name Field */}
                <div className="flex flex-col mb-3">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    Name
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      autoComplete="name"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

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
                <div className="flex flex-col mb-3">
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
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
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

                {/* Confirm Password Field */}
                <div className="flex flex-col mb-4">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5">
                    Confirm Password
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
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? (
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Footer Sign in Link */}
              <div className="text-center text-xs text-[#64748b] mt-4">
                <span>Already have an account?</span>{" "}
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="font-bold text-[#1e293b] hover:text-[#3b99e2] bg-transparent border-0 cursor-pointer disabled:opacity-50 transition-colors uppercase ml-1"
                >
                  SIGN IN
                </button>
              </div>
            </>
          ) : (
            /* OTP VERIFICATION STEP */
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#1e293b]">
                  ยืนยันรหัส OTP
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-xs text-[#64748b] hover:text-[#1e293b] underline cursor-pointer"
                >
                  แก้ไขข้อมูล
                </button>
              </div>

              <p className="text-xs text-[#64748b] mb-4 leading-relaxed">
                ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล{" "}
                <span className="font-semibold text-[#1e293b] break-all">{registeredEmail}</span>{" "}
                กรุณากรอกรหัสด้านล่างนี้เพื่อเปิดใช้งานบัญชี
              </p>

              

              <form className="w-full flex flex-col" onSubmit={handleVerifyOtp}>
                <div className="flex flex-col mb-4">
                  <label className="text-xs font-semibold text-[#334155] mb-1.5 text-center">
                    รหัสยืนยัน 6 หลัก
                  </label>
                  <div className="relative flex items-center justify-center bg-[#c4d7e6] rounded-xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="••••••"
                      autoFocus
                      disabled={loading}
                      required
                      className="w-full bg-transparent text-center font-mono text-2xl font-bold tracking-[0.35em] text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
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

                {/* Success Message */}
                {success && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                    <span>✅</span>
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit OTP Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/30 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>กำลังยืนยัน OTP...</span>
                    </>
                  ) : (
                    "ยืนยันรหัส OTP"
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center text-xs text-[#64748b] mt-4 flex items-center justify-center gap-1.5">
                  <span>ไม่ได้รับรหัส?</span>
                  <button
                    type="button"
                    disabled={countdown > 0 || resending}
                    onClick={handleResendOtp}
                    className="font-bold text-[#3b99e2] hover:text-[#288ad4] disabled:text-[#94a3b8] bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {resending
                      ? "กำลังส่ง..."
                      : countdown > 0
                      ? `ส่งรหัสใหม่ (${countdown}s)`
                      : "ขอรหัส OTP ใหม่"}
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

export default Register;
