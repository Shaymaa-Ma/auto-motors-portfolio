import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CHECK EXISTING LOGIN
  // =========================================================

  const checkAuth = async () => {
    try {
      const response = await authApi.me();

      if (response.success) {
        setAdmin(response.admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================
  //
  // The backend responds with a non-2xx status for every
  // failure case (401 wrong password, 403 disabled account,
  // 429 account lockout / IP rate limit). Axios throws on
  // any non-2xx response by default, so without this
  // try/catch, authApi.login() would throw instead of
  // resolving, and Login.jsx would never see
  // response.success / response.message /
  // response.attemptsRemaining for a failed attempt — it
  // would always fall through to the generic
  // "Unable to connect to the server." catch block, even
  // though the server responded just fine.
  //
  // Catching the error here and returning
  // error.response.data means login() always resolves with
  // the same { success, message, attemptsRemaining? }
  // shape whether the attempt succeeded or failed, so
  // Login.jsx's existing handling works unchanged.
  // =========================================================

  const login = async (email, password) => {
    try {
      const response = await authApi.login(
        email,
        password
      );

      if (response.success) {
        setAdmin(response.admin);
      }

      return response;
    } catch (error) {
      const responseData =
        error.response?.data;

      // A responseData object means the server responded
      // (400/401/403/429/...) with a normal JSON error body
      // — pass it through as-is. No responseData means the
      // request never reached the server at all (network
      // down, CORS, server offline).
      return (
        responseData || {
          success: false,
          message:
            "Unable to connect to the server.",
        }
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
    }
  };

  // =========================================================
  // INITIAL AUTH CHECK
  // =========================================================

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    admin,
    loading,
    isAuthenticated: !!admin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =========================================================
// useAuth HOOK
// =========================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};