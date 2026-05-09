import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export const api = {
  get: <T = any>(url: string, config?: any) => apiInstance.get(url, config) as Promise<T>,
  post: <T = any>(url: string, data?: any, config?: any) => apiInstance.post(url, data, config) as Promise<T>,
  patch: <T = any>(url: string, data?: any, config?: any) => apiInstance.patch(url, data, config) as Promise<T>,
  delete: <T = any>(url: string, config?: any) => apiInstance.delete(url, config) as Promise<T>,
};

// Request interceptor for inserting token
apiInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh
apiInstance.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/api/auth/refresh") {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = refreshResponse.data.data;
        
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }

        apiInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return apiInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login?error=session_expired";
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Return the response data directly if possible, or throw error with message
    const message = (error.response?.data as any)?.message || error.message;
    return Promise.reject(new Error(message));
  }
);
