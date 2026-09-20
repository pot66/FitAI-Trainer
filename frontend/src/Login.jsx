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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm flex flex-col items-center">
        {/* Header */}
        <div className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded-full mb-4 uppercase">
          AI FITNESS ASSISTANT
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">
          FitAI <span className="text-red-500 font-extrabold">Trainer</span>
        </h1>

        <p className="text-zinc-400 text-sm mb-6 text-center">
          เข้าสู่ระบบเพื่อเริ่มใช้งาน FitAI Trainer
        </p>

        {/* Login Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
              disabled={loading}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่านของคุณ"
              autoComplete="current-password"
              disabled={loading}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all disabled:opacity-50"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>

        {/* Register Navigation */}
        <div className="w-full mt-6 pt-5 border-t border-zinc-800/80 text-center text-sm text-zinc-400">
          <span>ยังไม่มีบัญชีใช่หรือไม่?</span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            disabled={loading}
            className="ml-2 font-bold text-red-400 hover:text-red-300 hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-50 transition-colors"
          >
            สมัครสมาชิก
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;