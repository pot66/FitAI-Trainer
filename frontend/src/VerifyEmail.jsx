import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";

function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("กำลังตรวจสอบ Email...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("error");
      setMessage("ไม่พบ Verification token");
      return;
    }

    api
      .get("/auth/verify-email", { params: { token } })
      .then((response) => {
        setStatus(response.data?.success ? "success" : "error");
        setMessage(response.data?.message || "ยินดีด้วย ยืนยัน Email สำเร็จแล้ว");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "เกิดข้อผิดพลาดในการยืนยัน Email"
        );
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#edf1f4] text-[#1e293b] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#abbed2] rounded-[32px] p-4 sm:p-5 shadow-xl flex flex-col items-center">
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden p-1 mb-2">
            <img src="/ai-trainer-logo.png" alt="Logo" className="w-full h-full object-cover" />
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

          {status !== "loading" && (
            <button
              type="button"
              className="w-full py-3.5 bg-[#3b99e2] hover:bg-[#288ad4] active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#3b99e2]/25 cursor-pointer"
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
