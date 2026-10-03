import { speakText, stopSpeech, isSpeakingNow } from "./utils/speechUtils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings({ onBack, theme, onThemeChange }) {
  const navigate = useNavigate();
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem("fitai-speech-rate") || "0.92"));
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(
    () => localStorage.getItem("fitai-ai-voice-enabled") !== "false"
  );

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
    const sampleText = "เอาล่ะ เริ่มกันเลยครับ ผมคือ AI Coach ประจำตัวของคุณ ค่อย ๆ หายใจ รักษาหลังให้ตรง และตั้งสมาธิให้ดีนะครับ";
    speakText(sampleText, {
      context: "default",
      rate: speechRate,
      force: true,
      onStart: () => setIsTestingVoice(true),
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false),
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

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#9bb0c4] bg-[#abbed2] sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-[#1e293b] border border-white/60 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>←</span>
            <span>กลับ</span>
          </button>
          <span className="text-sm font-bold text-[#1e293b] tracking-wide">การตั้งค่า</span>
          <span className="px-3 py-1 bg-white/50 border border-white/60 rounded-full text-xs font-semibold text-[#1e293b] shadow-sm">
            AI Settings
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
          {/* AI Voice System (HD Anime Mentor Voice Coach) */}
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[#1e293b]">เสียงผู้ช่วย AI (Anime Mentor Voice Coach)</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c4d7e6] text-[#1e293b] border border-slate-300">
                    Anime Mentor ชายผู้ใหญ่เสียงทุ้ม
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                  เสียงผู้ชายวัยผู้ใหญ่ สไตล์ Anime Mentor ต้นฉบับ เสียงทุ้ม นุ่ม ลึก สุขุม อบอุ่น และเป็นมืออาชีพ จังหวะปานกลางค่อนไปทางช้า พร้อมคำแนะนำท่าทางอย่างชัดเจน
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={aiVoiceEnabled}
                onClick={toggleVoice}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center shrink-0 ${
                  aiVoiceEnabled ? "bg-[#3b99e2] justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>

            {aiVoiceEnabled && (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#475569]">ความเร็วเสียงพูด (Speech Speed):</span>
                  <div className="flex items-center gap-2 mt-2">
                    {[
                      { label: "0.85x ช้าสุขุม", val: 0.85 },
                      { label: "0.92x จังหวะโค้ช (แนะนำ)", val: 0.92 },
                      { label: "1.0x มาตรฐาน", val: 1.0 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleRateChange(opt.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          Math.abs(speechRate - opt.val) < 0.05
                            ? "bg-[#3b99e2] text-white shadow-sm shadow-[#3b99e2]/25"
                            : "bg-[#edf1f4] text-[#475569] hover:bg-[#e2e8f0]"
                        }`}
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
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                      isTestingVoice
                        ? "bg-rose-100 border border-rose-300 text-rose-700 animate-pulse"
                        : "bg-[#3b99e2] hover:bg-[#288ad4] text-white"
                    }`}
                  >
                    <span>{isTestingVoice ? "⏹ หยุดเสียงทดสอบ" : "🔊 ทดสอบเสียง AI Coach (Anime Mentor)"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Theme Switcher */}
          <section className="bg-white border border-slate-200/80 rounded-[24px] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-[#1e293b]">ธีมการแสดงผล (Theme)</h2>
              <p className="text-xs text-[#64748b] mt-1">
                เลือกรูปแบบโทนสีสำหรับการใช้งานระบบ
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#edf1f4] p-1.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => onThemeChange && onThemeChange("light")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-white text-[#1e293b] shadow-sm"
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                ☀️ สว่าง (Light)
              </button>
              <button
                type="button"
                onClick={() => onThemeChange && onThemeChange("dark")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-white text-[#1e293b] shadow-sm"
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                🌙 มืด (Dark)
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;
