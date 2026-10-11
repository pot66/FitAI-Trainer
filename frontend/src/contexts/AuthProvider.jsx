import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Check Authentication
  // ============================================
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get("/profile/me");

      const profile = response.data?.data;

      if (profile?.user) {
        setUser(profile.user);
        localStorage.setItem("user", JSON.stringify(profile.user));
      } else {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          return;
        }
      }

      console.error("Authentication check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Login
  // ============================================
  const login = async (email, password) => {
    try {
      const cleanEmail = String(email).trim().toLowerCase();

      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }

      const token = data.data?.token;
      const loginUser = data.data?.user;

      if (!token) {
        throw new Error("ไม่พบ Token จาก Backend");
      }

      localStorage.setItem("token", token);
      if (loginUser) {
        localStorage.setItem("user", JSON.stringify(loginUser));
        setUser(loginUser);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("fitai-auth-changed", { detail: { user: loginUser } }));
        }
      }

      return {
        success: true,
        user: loginUser,
        token,
      };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "เข้าสู่ระบบไม่สำเร็จ",
      };
    }
  };

  // ============================================
  // Register (with OTP prompt)
  // ============================================
  const register = async (name, email, password) => {
    try {
      const cleanName = String(name).trim();
      const cleanEmail = String(email).trim().toLowerCase();

      const response = await api.post("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        password,
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "สมัครสมาชิกไม่สำเร็จ");
      }

      return {
        success: true,
        requireOtp: data.requireOtp !== false,
        email: data.email || cleanEmail,
        message: data.message || "สมัครสมาชิกสำเร็จ กรุณากรอกรหัส OTP",
      };
    } catch (error) {
      console.error("Register failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "สมัครสมาชิกไม่สำเร็จ",
      };
    }
  };

  // ============================================
  // Verify Register OTP
  // ============================================
  const verifyRegisterOtp = async (email, otp) => {
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const response = await api.post("/auth/verify-register-otp", {
        email: cleanEmail,
        otp: String(otp).trim(),
      });

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "ยืนยัน OTP ไม่สำเร็จ");
      }

      const token = data.data?.token;
      const verifiedUser = data.data?.user;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (verifiedUser) {
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("fitai-auth-changed", { detail: { user: verifiedUser } }));
        }
      }

      return {
        success: true,
        user: verifiedUser,
        token,
        message: data.message,
      };
    } catch (error) {
      console.error("Verify Register OTP failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "รหัส OTP ไม่ถูกต้องหรือหมดอายุ",
      };
    }
  };

  // ============================================
  // Resend Register OTP
  // ============================================
  const resendRegisterOtp = async (email) => {
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const response = await api.post("/auth/resend-register-otp", {
        email: cleanEmail,
      });

      const data = response.data;
      return {
        success: data.success,
        message: data.message,
      };
    } catch (error) {
      console.error("Resend OTP failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถส่งรหัส OTP ได้ในขณะนี้",
      };
    }
  };

  // ============================================
  // Logout
  // ============================================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fitai-auth-changed", { detail: { user: null } }));
      window.dispatchEvent(new CustomEvent("fitai-workout-completed", { detail: { exercises: [], user: null } }));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>กำลังโหลดข้อมูล...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        verifyRegisterOtp,
        resendRegisterOtp,
        logout,
        checkAuth,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth() ต้องอยู่ภายใน AuthProvider");
  }

  return context;
}
