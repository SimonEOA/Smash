"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    userName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/user/login`, {
        email,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setToken(response.data.access_token);
        setUser({ id: response.data.userId, email: email });
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    userName: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/user/register`, {
        username: userName,
        email,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setToken(response.data.access_token);
        setUser({ id: response.data.userId, email: email });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        // Manually set up the axios call for logout to avoid dependency issues
        await axios.delete(`${apiBaseUrl}/user/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } catch (error) {
        console.error("Logout failed:", error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
