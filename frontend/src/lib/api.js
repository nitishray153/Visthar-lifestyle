import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('visthar_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Add session ID for guest cart
    const sessionId = getSessionId();
    if (sessionId) {
        config.headers['X-Session-ID'] = sessionId;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('visthar_token');
            localStorage.removeItem('visthar_user');
        }
        return Promise.reject(error);
    }
);

function getSessionId() {
    let sid = localStorage.getItem('visthar_session');
    if (!sid) {
        sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        localStorage.setItem('visthar_session', sid);
    }
    return sid;
}

export function formatApiError(detail) {
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}

export default api;
