import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthProvider";

function Register({ onBack }) {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/login");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your username");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await register(cleanName, cleanEmail, password);

      if (!result.success) {
        setError(result.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully!");

      const loginResult = await login(cleanEmail, password);
      if (!loginResult.success) {
        setSuccess("Account created. Please log in.");
        setTimeout(() => {
          handleBack();
        }, 1200);
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "An error occurred during registration");
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
        <div className="w-full bg-white rounded-[26px] p-6 shadow-sm flex flex-col relative">
          
          {/* Top Row: Title + Close Button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1e293b]">
              Register
            </h2>
            <button
              type="button"
              onClick={handleBack}
              className="text-slate-400 hover:text-[#1e293b] transition-colors cursor-pointer p-1"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form className="w-full flex flex-col" onSubmit={handleRegister}>
            {/* Username Field */}
            <div className="flex flex-col mb-3">
              <label className="text-xs font-semibold text-[#334155] mb-1.5">
                Username
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Username"
                  autoComplete="name"
                  disabled={loading}
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

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
                  placeholder="Email"
                  autoComplete="email"
                  disabled={loading}
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col mb-3">
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col mb-4">
              <label className="text-xs font-semibold text-[#334155] mb-1.5">
                Confirm Password
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
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  className="w-full bg-transparent text-sm text-[#1e293b] placeholder-[#64748b] focus:outline-none disabled:opacity-50 pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#64748b] hover:text-[#1e293b] focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center gap-1.5">
                <span>✅</span>
                <span>{success}</span>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Sign in Link */}
          <div className="text-center text-xs text-[#64748b] mt-4">
            <span>Already have an account?</span>{" "}
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="font-bold text-[#1e293b] hover:text-[#3b99e2] bg-transparent border-0 cursor-pointer disabled:opacity-50 transition-colors uppercase ml-1"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
