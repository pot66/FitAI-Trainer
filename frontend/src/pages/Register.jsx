import { useState } from "react";
import { useAuth } from "../contexts/AuthProvider";

function Register({
  onBackToLogin,
}) {
  const {
    register,
    login,
  } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================
  // Submit
  // ============================================

  const handleRegister = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName =
      name.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    // ----------------------------------------
    // Validate Name
    // ----------------------------------------

    if (
      cleanName.length < 2
    ) {
      setError(
        "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร"
      );

      return;
    }

    // ----------------------------------------
    // Validate Email
    // ----------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {
      setError(
        "กรุณากรอก Email ให้ถูกต้อง"
      );

      return;
    }

    // ----------------------------------------
    // Validate Password
    // ----------------------------------------

    if (
      password.length < 8
    ) {
      setError(
        "Password ต้องมีอย่างน้อย 8 ตัวอักษร"
      );

      return;
    }

    // ----------------------------------------
    // Confirm Password
    // ----------------------------------------

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Password และ Confirm Password ไม่ตรงกัน"
      );

      return;
    }

    setLoading(true);

    try {
      // --------------------------------------
      // Register API
      // --------------------------------------

      const result =
        await register(
          cleanName,
          cleanEmail,
          password
        );

      if (!result.success) {
        setError(
          result.message ||
            "สมัครสมาชิกไม่สำเร็จ"
        );

        return;
      }

      // --------------------------------------
      // สมัครสำเร็จ
      // --------------------------------------

      setSuccess(
        "สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ..."
      );

      // --------------------------------------
      // Login ทันที
      // --------------------------------------

      const loginResult =
        await login(
          cleanEmail,
          password
        );

      if (
        !loginResult.success
      ) {
        setSuccess(
          "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ"
        );

        setTimeout(() => {
          onBackToLogin?.();
        }, 1200);

        return;
      }
    } catch (error) {
      console.error(
        "Register Error:",
        error
      );

      setError(
        error.message ||
          "เกิดข้อผิดพลาดในการสมัครสมาชิก"
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
          สร้างบัญชีเพื่อเริ่มใช้งาน
          FitAI Trainer
        </p>

        {/* =====================================
            Register Form
        ====================================== */}

        <form
          className="login-form"
          onSubmit={
            handleRegister
          }
        >

          {/* Name */}

          <div className="form-group">
            <label>
              ชื่อ
            </label>

            <input
              type="text"
              value={name}
              onChange={(
                event
              ) =>
                setName(
                  event.target.value
                )
              }
              placeholder="ชื่อของคุณ"
              autoComplete="name"
              disabled={loading}
              required
            />
          </div>

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

            <small
              style={{
                opacity: 0.7,
                marginTop:
                  "6px",
                display:
                  "block",
              }}
            >
              ใช้ Email ที่คุณสามารถ
              เข้าถึงได้
            </small>
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
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autoComplete="new-password"
              disabled={loading}
              required
            />
          </div>

          {/* Confirm Password */}

          <div className="form-group">
            <label>
              ยืนยัน Password
            </label>

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(
                event
              ) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="กรอก Password อีกครั้ง"
              autoComplete="new-password"
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

          {/* Success */}

          {success && (
            <div
              className="login-success"
            >
              ✅ {success}
            </div>
          )}

          {/* Register */}

          <button
            type="submit"
            className="primary-button login-button"
            disabled={loading}
          >
            {loading
              ? "กำลังสมัครสมาชิก..."
              : "สมัครสมาชิก"}
          </button>

        </form>

        {/* =====================================
            Back Login
        ====================================== */}

        <div
          style={{
            marginTop:
              "20px",
            textAlign:
              "center",
          }}
        >
          <span>
            มีบัญชีอยู่แล้ว?
          </span>

          <button
            type="button"
            onClick={
              onBackToLogin
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
            เข้าสู่ระบบ
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;