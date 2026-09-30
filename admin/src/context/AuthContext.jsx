// Manages the admin's login state across the application,
// including checking the existing session, logging in, logging out,
// refreshing the current administrator, and providing authentication
// information to other components.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../api/endpoints";


const AuthContext =
  createContext(null);


// =========================================================
// AUTH PROVIDER
// =========================================================

export const AuthProvider = ({
  children,
}) => {

  const [admin, setAdmin] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // =========================================================
  // CHECK EXISTING LOGIN
  // =========================================================
  //
  // The backend is the source of truth.
  //
  // The frontend does NOT store or inspect the JWT.
  // The JWT remains inside the HttpOnly cookie.
  //
  // /auth/me also verifies that the account still exists,
  // is active, and has the current role from the database.
  //
  // =========================================================

  const checkAuth = useCallback(
    async () => {

      try {

        const response =
          await authApi.me();


        if (
          response?.success &&
          response?.admin
        ) {

          setAdmin(
            response.admin
          );

        } else {

          setAdmin(null);

        }

      } catch (error) {

        // ---------------------------------------------------
        // Any authentication failure means the frontend
        // should consider the current session unauthenticated.
        // ---------------------------------------------------

        setAdmin(null);

      } finally {

        setLoading(false);

      }
    },
    []
  );


  // =========================================================
  // REFRESH CURRENT ADMIN
  // =========================================================
  //
  // Useful after profile/account information changes.
  //
  // This does not create or store a token on the frontend.
  // It simply asks the backend for the current authenticated
  // administrator again.
  //
  // =========================================================

  const refreshAdmin = useCallback(
    async () => {

      try {

        const response =
          await authApi.me();


        if (
          response?.success &&
          response?.admin
        ) {

          setAdmin(
            response.admin
          );


          return response.admin;

        }


        setAdmin(null);

        return null;

      } catch (error) {

        setAdmin(null);

        return null;

      }
    },
    []
  );


  // =========================================================
  // LOGIN
  // =========================================================
  //
  // The backend handles:
  //
  // - Browser ID throttling
  // - IP throttling
  // - Account/email throttling
  // - Password verification
  // - JWT creation
  // - HttpOnly authentication cookie
  //
  // The frontend only receives the safe administrator
  // information returned by the backend.
  //
  // =========================================================

  const login = async (
    email,
    password
  ) => {

    try {

      const response =
        await authApi.login(
          email,
          password
        );


      if (
        response?.success &&
        response?.admin
      ) {

        setAdmin(
          response.admin
        );

      }


      return response;

    } catch (error) {

      const responseData =
        error.response?.data;


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
  //
  // The backend removes the HttpOnly authentication cookie.
  //
  // Regardless of whether the request succeeds, the frontend
  // clears its local authentication state.
  //
  // =========================================================

  const logout = async () => {

    try {

      await authApi.logout();

    } catch (error) {

      // -----------------------------------------------------
      // Even if the server request fails, clear the local
      // authentication state so the UI does not continue
      // treating the user as logged in.
      // -----------------------------------------------------

      console.error(
        "Logout error:",
        error
      );

    } finally {

      setAdmin(null);

    }
  };


  // =========================================================
  // INITIAL AUTH CHECK
  // =========================================================
  //
  // Runs once when the AuthProvider is mounted.
  //
  // =========================================================

  useEffect(() => {

    checkAuth();

  }, [checkAuth]);


  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = {

    admin,

    loading,

    isAuthenticated:
      !!admin,

    login,

    logout,

    refreshAdmin,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};


// =========================================================
// useAuth HOOK
// =========================================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;
};