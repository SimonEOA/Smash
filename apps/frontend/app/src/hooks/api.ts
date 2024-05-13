import axios from "axios";
import { useMemo } from "react";
import { useAuth } from "./auth";

export const useApi = () => {
  const { token } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Intercept request to add token
    instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token]);

  return api;
};
