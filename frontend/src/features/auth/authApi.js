import api from "@/utils/axios";

export const authApi = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    logout: () => api.post("/auth/logout"),
    getMe: () => api.get("/auth/me"),
    sendOtp: (data) => api.post("/auth/send-otp", data),
    verifyOtp: (data) => api.post("/auth/verify-otp", data),
    resetPassword: (data) => api.post("/auth/reset-password", data),
    refreshToken: () => api.post("/auth/refresh"),
};