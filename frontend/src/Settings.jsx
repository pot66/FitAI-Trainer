import { useState } from "react";

function Settings({ onBack, theme, onThemeChange }) {
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(
    () => localStorage.getItem("fitai-ai-voice-enabled") !== "false"
  );

  const toggleVoice = () => {
    const next = !aiVoiceEnabled;
    setAiVoiceEnabled(next);
    localStorage.setItem("fitai-ai-voice-enabled", String(next));
    if (!next) window.speechSynthesis?.cancel();
  };

  return (
    <div className="profile-page settings-page">
      <header className="profile-header">
        <button type="button" className="back-button" onClick={onBack}>← กลับไปแชท</button>
        <div className="profile-header-title"><h1>การตั้งค่า</h1><p>ปรับการแสดงผลและการตอบด้วยเสียงของ FitAI</p></div>
      </header>
      <main className="profile-container settings-container">
        <section className="settings-card">
          <div><h2>เสียงตอบจาก AI</h2><p>ให้ AI อ่านคำตอบออกเสียงหลังตอบในแชท</p></div>
          <button type="button" className={aiVoiceEnabled ? "voice-setting-switch enabled" : "voice-setting-switch"} role="switch" aria-checked={aiVoiceEnabled} onClick={toggleVoice}><span />{aiVoiceEnabled ? "เปิด" : "ปิด"}</button>
        </section>
        <section className="settings-card">
          <div><h2>โหมดสี</h2><p>เลือกโทนสีที่สบายตาสำหรับการใช้งาน</p></div>
          <div className="theme-options">
            <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => onThemeChange("dark")}>มืด</button>
            <button type="button" className={theme === "light" ? "active" : ""} onClick={() => onThemeChange("light")}>สว่าง</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
