import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";
import { useAuth } from "./auth";

export const useApi = (): AxiosInstance => {
  const { token } = useAuth();

  const api: AxiosInstance = useMemo(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log("API URL", baseURL);

    if (!baseURL) {
      throw new Error("API base URL is not defined");
    }

    const instance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(
      (config) => {
        if (token && config.headers) {
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
