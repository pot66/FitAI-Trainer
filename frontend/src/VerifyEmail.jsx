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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
        <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-full mb-4 uppercase">
          FITAI TRAINER
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Email <span className="text-red-500">Verification</span>
        </h1>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        {status !== "loading" && (
          <button
            type="button"
            className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            ไปที่หน้าเข้าสู่ระบบ
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;