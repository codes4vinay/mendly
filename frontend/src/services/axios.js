import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.DEV
        ? "http://localhost:5000/api"
        : "https://mendly-backend-fnbdhxakadhvezet.centralindia-01.azurewebsites.net/api");

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Add token to requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 unauthorized - token expired
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
