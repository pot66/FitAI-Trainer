import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await login(cleanEmail, password);
      if (!result.success) {
        setError(result.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf1f4] flex items-center justify-center p-4">
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
        <div className="w-full bg-white rounded-[26px] p-6 shadow-sm flex flex-col">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
            Sign in
          </h2>

          <form className="w-full flex flex-col" onSubmit={handleLogin}>
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
            <div className="flex flex-col mb-1.5">
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="mt-1 mb-4 text-left">
              <span className="text-[11px] text-[#64748b] hover:text-[#1e293b] cursor-pointer transition-colors">
                Forgot Password
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{error}</span>
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
                  <span>LOGGING IN...</span>
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center text-xs text-[#64748b] mt-4">
            <span>Don't have an account?</span>{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              disabled={loading}
              className="font-bold text-[#1e293b] hover:text-[#3b99e2] bg-transparent border-0 cursor-pointer disabled:opacity-50 transition-colors uppercase"
            >
              REGISTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
