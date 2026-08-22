import { useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import Register from "./Register";

function Login() {
  const {
    login,
  } = useAuth();

  const [
    showRegister,
    setShowRegister,
  ] = useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================
  // Register Page
  // ============================================

  if (showRegister) {
    return (
      <Register
        onBackToLogin={() =>
          setShowRegister(
            false
          )
        }
      />
    );
  }

  // ============================================
  // Login
  // ============================================

  const handleLogin = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    try {
      const result =
        await login(
          cleanEmail,
          password
        );

      if (!result.success) {
        setError(
          result.message ||
            "เข้าสู่ระบบไม่สำเร็จ"
        );
      }
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      setError(
        error.message ||
          "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* =====================================
            Header
        ====================================== */}

        <div className="badge">
          AI FITNESS ASSISTANT
        </div>

        <h1>
          FitAI
          <span> Trainer</span>
        </h1>

        <p className="login-description">
          เข้าสู่ระบบเพื่อใช้งาน
          FitAI Trainer
        </p>

        {/* =====================================
            Login Form
        ====================================== */}

        <form
          className="login-form"
          onSubmit={
            handleLogin
          }
        >

          {/* Email */}

          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="example@gmail.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}

          <div className="form-group">
            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Password"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          {/* Error */}

          {error && (
            <div className="login-error">
              ❌ {error}
            </div>
          )}

          {/* Login */}

          <button
            type="submit"
            className="primary-button login-button"
            disabled={loading}
          >
            {loading
              ? "กำลังเข้าสู่ระบบ..."
              : "เข้าสู่ระบบ"}
          </button>

        </form>

        {/* =====================================
            Register
        ====================================== */}

        <div
          style={{
            marginTop:
              "22px",
            paddingTop:
              "18px",
            borderTop:
              "1px solid rgba(255,255,255,0.1)",
            textAlign:
              "center",
          }}
        >
          <span>
            ยังไม่มีบัญชี?
          </span>

          <button
            type="button"
            onClick={() =>
              setShowRegister(
                true
              )
            }
            disabled={loading}
            style={{
              marginLeft:
                "8px",
              border:
                "none",
              background:
                "none",
              cursor:
                "pointer",
              fontWeight:
                "700",
            }}
          >
            สมัครสมาชิก
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;