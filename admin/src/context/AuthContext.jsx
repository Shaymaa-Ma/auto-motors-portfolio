import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [admin, setAdmin] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const isAuthenticated =
    Boolean(admin);

  /* -------------------------------------------------------
     Check existing session
  ------------------------------------------------------- */

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response =
          await authApi.me();

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

    checkAuth();
  }, []);

  /* -------------------------------------------------------
     Login
  ------------------------------------------------------- */

  const login = async (
    email,
    password
  ) => {
    const response =
      await authApi.login(
        email,
        password
      );

    if (response.success) {
      setAdmin(response.admin);
    }

    return response;
  };

  /* -------------------------------------------------------
     Logout
  ------------------------------------------------------- */

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};