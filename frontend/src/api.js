/**
 * api.js – Axios instance for Foodie Corner
 * ─────────────────────────────────────────
 * - Single base URL for all requests
 * - Attaches JWT from sessionStorage (tab-isolated) on every request
 * - Handles 401 (expired session) gracefully
 * - Handles network errors with a meaningful message
 */
import axios from "axios";
import { getToken, clearSession } from "./utils/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,  // 15-second request timeout
});

// ── Request interceptor: attach token from sessionStorage ──
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle errors globally ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Session expired or token invalid — clear THIS tab and redirect
        clearSession();

        if (window.location.pathname !== "/login") {
          const banner = document.createElement("div");
          banner.setAttribute("id", "fc-session-expired-banner");
          banner.innerHTML = `
            <div style="
              position:fixed;top:0;left:0;right:0;z-index:99999;
              background:#dc2626;color:#fff;text-align:center;
              padding:14px 20px;font-size:14px;font-weight:700;
              font-family:Inter,-apple-system,sans-serif;
              box-shadow:0 4px 16px rgba(0,0,0,0.3);
            ">
              🔒 Your session has expired. Redirecting to login...
            </div>
          `;
          document.body.prepend(banner);
          setTimeout(() => {
            window.location.href = "/login";
          }, 1800);
        }
      }

      if (status === 429) {
        error.message = "Too many requests. Please wait a moment before trying again.";
      }

      if (status >= 500) {
        error.message = "Server error. Please try again shortly.";
      }
    } else if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Check your internet connection.";
    } else if (!error.response) {
      error.message = "Cannot reach the server. Check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
