import axios from "axios";
import { store } from "../app/store";
import { setCredentials, logout } from "../features/auth/authSlice";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,   // sends httpOnly cookie automatically
});

// attach access token to every request
api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// auto refresh token when access token expires
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // if 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // refresh token cookie sent automatically
                const response = await axios.post(
                    "http://localhost:5000/api/auth/refresh",
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;

                // update store with new access token
                store.dispatch(setCredentials({
                    user: store.getState().auth.user,
                    accessToken,
                }));

                // retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // refresh failed — logout user
                store.dispatch(logout());
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;