import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { formatApiError } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('visthar_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch {
            localStorage.removeItem('visthar_token');
            localStorage.removeItem('visthar_user');
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => { checkAuth(); }, [checkAuth]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('visthar_token', data.token);
            setUser(data.user);
            return { success: true };
        } catch (e) {
            return { success: false, error: formatApiError(e.response?.data?.detail) };
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password, phone });
            localStorage.setItem('visthar_token', data.token);
            setUser(data.user);
            return { success: true };
        } catch (e) {
            return { success: false, error: formatApiError(e.response?.data?.detail) };
        }
    };

    const logout = () => {
        localStorage.removeItem('visthar_token');
        localStorage.removeItem('visthar_user');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
