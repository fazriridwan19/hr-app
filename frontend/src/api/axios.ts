import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth.store";

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequestResolver = (token: string) => void;
type FailedRequestRejector = (error: unknown) => void;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: FailedRequestResolver;
  reject: FailedRequestRejector;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const employeeApi: AxiosInstance = axios.create({
  baseURL: "/api/employee",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const attendanceApi: AxiosInstance = axios.create({
  baseURL: "/api/attendance",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const attachAuthToken = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

const createResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryAxiosRequestConfig;

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{
          meta: { code: number; message: string };
          data: { accessToken: string };
        }>("/api/employee/auth/refresh", {}, { withCredentials: true });
        const { accessToken } = response.data.data;

        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

employeeApi.interceptors.request.use(attachAuthToken);
attendanceApi.interceptors.request.use(attachAuthToken);

createResponseInterceptor(employeeApi);
createResponseInterceptor(attendanceApi);
