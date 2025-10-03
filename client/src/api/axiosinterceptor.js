import axios from "axios";
import api from "./api";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    })
    failedQueue = [];
};

api.interceptors.request.use(
    async config => {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            config.headers['Authorization'] = 'Bearer ' + access_token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)


api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && (error.response.data.message === "jwt expired" || error.response.data.message === "Unauthorized") && !originalRequest._retry) {
            if (isRefreshing) {

                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/v1/refresh`, {}, {
                    withCredentials: true, headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('refresh_token')
                    }
                });
                if (refreshResponse.data.success) {
                    isRefreshing = false;
                    processQueue(null, refreshResponse.data.token);
                    originalRequest.headers['Authorization'] = 'Bearer ' + refreshResponse.data.token;
                    return api(originalRequest);
                } else {
                    isRefreshing = false;
                    processQueue(refreshResponse.data.message);
                    return Promise.reject(refreshResponse.data.message);
                }
            } catch (error) {
                isRefreshing = false;
                processQueue(error);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
)

export default api;