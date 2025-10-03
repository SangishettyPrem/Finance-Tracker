import { createContext, useState, useContext } from "react";
import api from "../api/axiosinterceptor";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLogout, setIsLogout] = useState(false);


    const login = async (newUserData) => {
        try {
            const response = await api.post(`/api/auth/v1/login`, newUserData, { withCredentials: true });
            if (response.data.success) {
                localStorage.setItem('is-logged-in', true);
                localStorage.setItem('access_token', response.data.accessToken);
                localStorage.setItem('refresh_token', response.data.refreshToken);
                debugger
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: error?.response?.data?.message || error.message || "An error occurred during login." };
        }
    }

    const signUp = async (registrationData) => {
        try {
            const response = await api.post(`/api/auth/v1/signup`, registrationData, { withCredentials: true });
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message || "An error occurred during sign up." };
        }
    }

    const verifyUser = async () => {
        try {
            const response = await api.get(`/api/auth/v1/verify`, { withCredentials: true });
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            } else {
                setUser(null);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: error?.response?.data?.message || error.message || "An error occurred during verification." };
        }
    }

    const RefreshHandler = async () => {
        try {
            const response = await api.post("/api/auth/v1/refresh", {}, {
                withCredentials: true
            });
            if (response.data.success) {
                localStorage.setItem('access_token', response.data.accessToken);
                localStorage.setItem('refresh_token', response.data.refreshToken);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response?.data?.message || "Failed to Refresh Token"
                }
            }
        } catch (error) {
            return { success: false, message: error?.response?.data?.message || error.message || "An occured During Refresh Handle." };

        }
    }

    const logout = async () => {
        try {
            setIsLogout(true);
            const response = await api.post(`/api/auth/v1/logout`, {}, { withCredentials: true });
            if (response.data.success) {
                localStorage.removeItem('is-logged-in');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
                setIsLogout(false);
                return { success: true };
            } else {
                setIsLogout(false);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            setIsLogout(false);
            return { success: false, message: error?.response?.data?.message || error.message || "An error occurred during logout." };
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isLogout,
            setIsLogout,

            login,
            signUp,
            verifyUser,
            logout,
            RefreshHandler
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);