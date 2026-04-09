import axios from "axios";
import { store } from "../app/store";
import { setCredentials, logout } from "../features/auth/authSlice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.DEV
        ? "http://localhost:5000/api"
        : "https://mendly-backend-fnbdhxakadhvezet.centralindia-01.azurewebsites.net/api");

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];
const authBypassPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/send-otp",
    "/auth/verify-otp",
    "/auth/reset-password",
];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestPath = originalRequest?.url || "";
        const shouldBypassRefresh = authBypassPaths.some((path) =>
            requestPath.includes(path)
        );

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !shouldBypassRefresh
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;

                store.dispatch(setCredentials({
                    user: store.getState().auth.user,
                    accessToken,
                }));

                api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
