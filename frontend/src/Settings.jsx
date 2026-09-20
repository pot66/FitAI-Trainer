import { speakText, stopSpeech, isSpeakingNow } from "./utils/speechUtils";
﻿import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings({ onBack, theme, onThemeChange }) {
  const navigate = useNavigate();
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem("fitai-speech-rate") || "1.0"));
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
    const sampleText = "สวัสดีครับ FitAI Trainer พร้อมดูแลการออกกำลังกายและโภชนาการของคุณ Welcome to FitAI, let's crush your fitness goals together!";
    speakText(sampleText, {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>←</span>
            <span>กลับ</span>
          </button>
          <span className="text-sm font-semibold text-zinc-300">การตั้งค่า</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full mb-2 uppercase">
            FITAI SETTINGS
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>⚙️</span>
            <span>การตั้งค่า</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ปรับแต่งการแสดงผลและตัวเลือกการทำงานของ FitAI Trainer
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* AI Voice System (HD Bilingual Engine) */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">เสียงผู้ช่วย AI (HD Bilingual Text-to-Speech)</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                    ไทย & EN ชัดเจน
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  ระบบสังเคราะห์เสียงอัจฉริยะ ออกเสียงภาษาไทยและภาษาอังกฤษชัดเจนทุกคำ พร้อมแปลงศัพท์ฟิตเนสและหน่วยอัตโนมัติ
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={aiVoiceEnabled}
                onClick={toggleVoice}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center shrink-0 ${
                  aiVoiceEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>

            {aiVoiceEnabled && (
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-200">ความเร็วเสียงพูด (Speech Speed):</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    {[
                      { label: "0.85x ช้าชัด", val: 0.85 },
                      { label: "1.0x มาตรฐาน", val: 1.0 },
                      { label: "1.15x เร็ว", val: 1.15 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleRateChange(opt.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          Math.abs(speechRate - opt.val) < 0.05
                            ? "bg-red-600 text-white shadow-sm"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isTestingVoice
                        ? "bg-red-950/70 border border-red-700/60 text-red-400 animate-pulse"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                    }`}
                  >
                    <span>{isTestingVoice ? "⏹ หยุดเสียงทดสอบ" : "🔊 ทดสอบเสียง AI (ไทย + EN)"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Theme Switcher */}
          <section className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">ธีมการแสดงผล (Theme)</h2>
              <p className="text-xs text-zinc-400 mt-1">
                เลือกรูปแบบโทนสีสำหรับการใช้งานระบบ
              </p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => onThemeChange && onThemeChange("dark")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🌙 มืด (Dark)
              </button>
              <button
                type="button"
                onClick={() => onThemeChange && onThemeChange("light")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                ☀️ สว่าง (Light)
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;