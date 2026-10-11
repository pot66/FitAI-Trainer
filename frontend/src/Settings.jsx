import { speakText, stopSpeech, isSpeakingNow } from "./utils/speechUtils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";
import api from "./services/api";

function Settings({ onBack, theme, onThemeChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Voice Settings state
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem("fitai-speech-rate") || "0.92"));
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(
    () => localStorage.getItem("fitai-ai-voice-enabled") !== "false"
  );

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Countdown for Change Password OTP
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleRateChange = (rate) => {
    setSpeechRate(rate);
    localStorage.setItem("fitai-speech-rate", String(rate));
  };

  const handleTestVoice = () => {
    if (isTestingVoice || isSpeakingNow()) {
      stopSpeech();
      setIsTestingVoice(false);
      return;
    }
    setIsTestingVoice(true);
    const sampleText = "เอาล่ะ เริ่มกันเลยครับ ผมคือ AI Coach ประจำตัวของคุณ ค่อย ๆ หายใจ รักษาหลังให้ตรง โฟกัสกับกล้ามเนื้อ แล้วลุยไปด้วยกันครับ!";
    speakText(sampleText, {
      rate: speechRate,
      force: true,
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false)
    });
  };

  const toggleVoice = () => {
    const next = !aiVoiceEnabled;
    setAiVoiceEnabled(next);
    localStorage.setItem("fitai-ai-voice-enabled", String(next));
    if (!next) stopSpeech();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Request OTP for changing password
  const handleRequestChangePwOtp = async () => {
    setPwError("");
    setPwSuccess("");

    if (!currentPassword) {
      setPwError("กรุณากรอกรหัสผ่านปัจจุบัน");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setPwLoading(true);

    try {
      const res = await api.post("/auth/change-password/request-otp");
      if (res.data?.success) {
        setOtpSent(true);
        setCountdown(60);
        setPwSuccess("ส่งรหัส OTP 6 หลักไปยังอีเมลของคุณแล้ว กรุณานำมากรอกเพื่อยืนยัน");
      } else {
        setPwError(res.data?.message || "ไม่สามารถส่งรหัส OTP ได้");
      }
    } catch (err) {
      console.error("Request Change Password OTP Error:", err);
      setPwError(
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดในการขอรหัส OTP"
      );
    } finally {
      setPwLoading(false);
    }
  };

  // Confirm change password with OTP
  const handleConfirmChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword) {
      setPwError("กรุณากรอกรหัสผ่านปัจจุบัน");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (otp.trim().length !== 6) {
      setPwError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }

    setPwLoading(true);

    try {
      const res = await api.post("/auth/change-password/confirm", {
        currentPassword,
        newPassword,
        confirmPassword,
        otp: otp.trim(),
      });

      if (res.data?.success) {
        setPwSuccess("เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setOtpSent(false);
      } else {
        setPwError(res.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Confirm Change Password Error:", err);
      setPwError(
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
      );
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>←</span>
            <span>กลับ</span>
          </button>
          <span className="text-sm font-bold text-[#1e293b] tracking-wide">การตั้งค่า</span>
          <span className="hidden sm:inline-block px-3 py-1 bg-white/50 border border-white/60 rounded-full text-xs font-semibold text-[#1e293b] shadow-sm">AI Settings
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-[#1e293b] bg-white border border-slate-200/80 rounded-full mb-2 uppercase shadow-sm">
            FITAI SETTINGS
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>⚙️</span>
            <span>การตั้งค่า</span>
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            ปรับแต่งการแสดงผลและตัวเลือกการทำงานของ FitAI Trainer
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* AI Voice Toggle System (ระบบเปิด-ปิดเสียงพูดของ AI) */}
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm transition-all">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-xl bg-[#c4d7e6] flex items-center justify-center text-[#1e293b] shrink-0">
                    {aiVoiceEnabled ? (
                      <svg className="w-4 h-4 text-[#0284c7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-[#1e293b]">
                    เปิด-ปิดเสียงพูดของ AI
                  </h2>
                  <span
                    className={
                      "px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors " +
                      (aiVoiceEnabled
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-slate-100 text-slate-500 border-slate-300")
                    }
                  >
                    {aiVoiceEnabled ? "เปิดใช้งานเสียงพูด" : "ปิดเสียงพูด"}
                  </span>

                </div>
                <p className="text-xs text-[#64748b] mt-2 leading-relaxed">
                  {aiVoiceEnabled
                    ? "เปิดเสียงพูดบรรยายและเสียงตอบกลับของ AI โค้ชอัตโนมัติ (สามารถปิดเสียงได้หากต้องการให้อ่านเป็นข้อความเท่านั้น)"
                    : "ปิดเสียงพูดของ AI แล้ว ระบบจะแสดงผลเป็นข้อความตัวอักษรอย่างเดียวโดยไม่มีเสียงพูดบรรยาย สามารถเปิดสวิตช์เพื่อเปิดเสียงพูดได้ทุกเมื่อ"}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className={"text-xs font-bold transition-colors " + (aiVoiceEnabled ? "text-[#0284c7]" : "text-slate-400")}>
                  {aiVoiceEnabled ? "เปิด" : "ปิด"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiVoiceEnabled}
                  onClick={toggleVoice}
                  className={
                    "w-14 h-8 rounded-full p-1 transition-all cursor-pointer flex items-center shrink-0 shadow-inner " +
                    (aiVoiceEnabled
                      ? "bg-[#3b99e2] justify-end"
                      : "bg-slate-300 hover:bg-slate-400/80 justify-start")
                  }
                  title={aiVoiceEnabled ? "คลิกเพื่อปิดเสียงพูด AI" : "คลิกเพื่อเปิดเสียงพูด AI"}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>
            </div>

            {aiVoiceEnabled ? (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#475569]">ความเร็วเสียงพูด (Speech Speed):</span>
                  <div className="flex items-center gap-2 mt-2">
                    {[
                      { label: "0.92x มาตรฐาน ", val: 0.92 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleRateChange(opt.val)}
                        className={
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                          (Math.abs(speechRate - opt.val) < 0.05
                            ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25"
                            : "bg-[#edf1f4] text-[#475569] hover:bg-[#e2e8f0]")
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className={
                      "px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm " +
                      (isTestingVoice
                        ? "bg-rose-100 border border-rose-300 text-rose-700 animate-pulse"
                        : "bg-[#3b99e2] hover:bg-[#288ad4] text-white")
                    }
                  >
                    <span>
                      {isTestingVoice ? "⏹ หยุดเสียงทดสอบ" : "🔊 ทดสอบเสียงพูด AI (Anime Mentor)"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748b] bg-[#f8fafc] px-4 py-3 rounded-2xl border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>เสียงพูดของ AI ถูกปิดใช้งานอยู่ (ระบบจะตอบกลับและแสดงผลเป็นข้อความเท่านั้น)</span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
                >
                  เปิดเสียงตอนนี้
                </button>
              </div>
            )}
          </section>



          {/* Change Password with OTP Section */}
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <h2 className="text-base font-bold text-[#1e293b]">ความปลอดภัยและเปลี่ยนรหัสผ่าน (Change Password)</h2>
              </div>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                เปลี่ยนรหัสผ่านของคุณอย่างปลอดภัย โดยระบบจะส่งรหัส OTP 6 หลักไปยังอีเมล{" "}
                <span className="font-semibold text-[#1e293b]">{user?.email || "ของคุณ"}</span> เพื่อยืนยันตัวตน
              </p>
            </div>

            <form onSubmit={handleConfirmChangePassword} className="flex flex-col gap-4 max-w-lg">
              {/* Current Password */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#334155] mb-1.5">
                  รหัสผ่านปัจจุบัน (Current Password)
                </label>
                <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={pwLoading}
                    required
                    className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                  >
                    {showCurrentPw ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#334155] mb-1.5">
                  รหัสผ่านใหม่ (New Password)
                </label>
                <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    disabled={pwLoading}
                    required
                    className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                  >
                    {showNewPw ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-[#334155] mb-1.5">
                  ยืนยันรหัสผ่านใหม่ (Confirm New Password)
                </label>
                <div className="relative flex items-center bg-[#c4d7e6] rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    disabled={pwLoading}
                    required
                    className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                  >
                    {showConfirmPw ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>




              {/* OTP Field (shows when OTP is requested) */}
              {otpSent && (
                <div className="flex flex-col p-4 bg-[#edf1f4] rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1e293b]">
                      รหัสยืนยัน OTP 6 หลัก จากอีเมล
                    </label>
                    <span className="text-[11px] text-[#64748b]">
                      {countdown > 0 ? "ขอรหัสใหม่ได้ใน (" + countdown + "s)" : "ขอรหัสใหม่ได้แล้ว"}
                    </span>
                  </div>
                  <div className="relative flex items-center justify-center bg-white rounded-xl px-3.5 py-2 border border-slate-300 transition-all focus-within:ring-2 focus-within:ring-[#3b99e2]">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="••••••"
                      autoFocus
                      disabled={pwLoading}
                      required
                      className="w-full bg-transparent text-center font-mono text-xl font-bold tracking-[0.3em] text-[#1e293b] placeholder-[#94a3b8] focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {pwError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{pwError}</span>
                </div>
              )}

              {/* Success Alert */}
              {pwSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                  <span>✅</span>
                  <span>{pwSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleRequestChangePwOtp}
                    disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="px-5 py-3 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm shadow-[#3b99e2]/25 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {pwLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>กำลังส่ง OTP...</span>
                      </>
                    ) : (
                      "ขอรหัส OTP ทางอีเมล"
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={pwLoading || otp.trim().length !== 6}
                      className="px-5 py-3 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm shadow-[#3b99e2]/25 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {pwLoading ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>กำลังตรวจสอบและเปลี่ยนรหัสผ่าน...</span>
                        </>
                      ) : (
                        "ยืนยันการเปลี่ยนรหัสผ่าน"
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={pwLoading || countdown > 0}
                      onClick={handleRequestChangePwOtp}
                      className="px-4 py-3 bg-white hover:bg-slate-50 text-[#475569] border border-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? "ส่งรหัสใหม่ (" + countdown + "s)" : "ขอรหัส OTP อีกครั้ง"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;
