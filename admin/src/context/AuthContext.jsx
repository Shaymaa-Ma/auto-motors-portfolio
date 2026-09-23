
// Manages the admin's login state across the application, 
// including checking the existing session, logging in, logging out, 
// and providing authentication information to other components.

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../api/endpoints";


const AuthContext =
  createContext(null);


export const AuthProvider = ({
  children,
}) => {

  const [admin, setAdmin] =
    useState(null);

  const [loading, setLoading] =
    useState(true);



  // CHECK EXISTING LOGIN

  const checkAuth = async () => {

    try {

      const response =
        await authApi.me();


      if (response.success) {

        setAdmin(
          response.admin
        );

      } else {

        setAdmin(null);

      }

    } catch (error) {

      setAdmin(null);

    } finally {

      setLoading(false);

    }
  };



  // LOGIN

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


      if (response.success) {

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



  // LOGOUT

  const logout = async () => {

    try {

      await authApi.logout();

    } finally {

      setAdmin(null);

    }
  };


  // INITIAL AUTH CHECK

  useEffect(() => {

    checkAuth();

  }, []);



  // CONTEXT VALUE

  const value = {

    admin,

    loading,

    isAuthenticated:
      !!admin,

    login,

    logout,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};



// useAuth HOOK

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