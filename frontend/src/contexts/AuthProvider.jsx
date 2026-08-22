import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ============================================
  // Check Authentication
  // ============================================

  const checkAuth = async () => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setUser(null);
        return;
      }

      const response =
        await api.get(
          "/profile/me"
        );

      console.log(
        "Auth Profile:",
        response.data
      );

      const profile =
        response.data?.data;

      if (profile?.user) {
        setUser(
          profile.user
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            profile.user
          )
        );
      } else {
        const savedUser =
          localStorage.getItem(
            "user"
          );

        if (savedUser) {
          setUser(
            JSON.parse(
              savedUser
            )
          );
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

      console.error(
        "Authentication check failed:",
        error
      );

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

  const login = async (
    email,
    password
  ) => {
    try {
      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const response =
        await api.post(
          "/auth/login",
          {
            email:
              cleanEmail,
            password,
          }
        );

      console.log(
        "Login response:",
        response.data
      );

      const data =
        response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "เข้าสู่ระบบไม่สำเร็จ"
        );
      }

      const token =
        data.data?.token;

      const loginUser =
        data.data?.user;

      if (!token) {
        throw new Error(
          "ไม่พบ Token จาก Backend"
        );
      }

      // ----------------------------------------
      // Save Token
      // ----------------------------------------

      localStorage.setItem(
        "token",
        token
      );

      // ----------------------------------------
      // Save User
      // ----------------------------------------

      if (loginUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            loginUser
          )
        );

        setUser(
          loginUser
        );
      }

      return {
        success: true,
        user: loginUser,
        token,
      };
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data
            ?.message ||
          error.message ||
          "เข้าสู่ระบบไม่สำเร็จ",
      };
    }
  };

  // ============================================
  // Register
  // ============================================

  const register = async (
    name,
    email,
    password
  ) => {
    try {
      const cleanName =
        String(name).trim();

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const response =
        await api.post(
          "/auth/register",
          {
            name:
              cleanName,
            email:
              cleanEmail,
            password,
          }
        );

      console.log(
        "Register response:",
        response.data
      );

      const data =
        response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "สมัครสมาชิกไม่สำเร็จ"
        );
      }

      return {
        success: true,
        user:
          data.data,
        message:
          data.message ||
          "สมัครสมาชิกสำเร็จ",
      };
    } catch (error) {
      console.error(
        "Register failed:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data
            ?.message ||
          error.message ||
          "สมัครสมาชิกไม่สำเร็จ",
      };
    }
  };

  // ============================================
  // Logout
  // ============================================

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };

  // ============================================
  // Initial Authentication Check
  // ============================================

  useEffect(() => {
    checkAuth();
  }, []);

  // ============================================
  // Loading
  // ============================================

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <h2>
          กำลังโหลดข้อมูล...
        </h2>
      </div>
    );
  }

  // ============================================
  // Provider
  // ============================================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        checkAuth,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// useAuth
// ============================================

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth() ต้องอยู่ภายใน AuthProvider"
    );
  }

  return context;
}
