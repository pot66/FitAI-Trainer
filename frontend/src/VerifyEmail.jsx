import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";

function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("กำลังยืนยัน Email...");
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
        setMessage(response.data?.message || "ดำเนินการยืนยัน Email แล้ว");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "ไม่สามารถยืนยัน Email ได้"
        );
      });
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="badge">FITAI TRAINER</div>
        <h1>
          Email <span>Verification</span>
        </h1>
        <p className="login-description">{message}</p>

        {status !== "loading" && (
          <button
            type="button"
            className="primary-button login-button"
            onClick={() => navigate("/login")}
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
