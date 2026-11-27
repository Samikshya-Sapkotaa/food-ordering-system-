/**
 * AuthContext — Foodie Corner
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses tab-isolated sessionStorage (via utils/session.js) so each browser tab
 * can be logged in as a different account simultaneously.
 *
 * Flow:
 * 1. On mount: restore session from sessionStorage (or fall back to localStorage)
 * 2. Silently re-validate + refresh token from DB every time the tab loads
 * 3. login() saves to sessionStorage + localStorage; logout() clears both
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getToken, getStoredUser, setSession, clearSession } from "../utils/session";

const AuthContext = createContext();

const BASE_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Mount: restore saved session then re-validate with DB ──
  useEffect(() => {
    const savedToken = getToken();
    const savedUser  = getStoredUser();

    if (savedToken && savedUser) {
      // Optimistically restore from storage so the UI shows immediately
      setUser(savedUser);
      // Then validate & refresh from DB in background
      refreshFromServer(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Refresh user + token from the server ──────────────────
  async function refreshFromServer(token) {
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { token: newToken, user: freshUser } = res.data;
      setSession(newToken, freshUser);
      setUser(freshUser);
    } catch (err) {
      // 401 → token is invalid or expired → force logout for this tab
      if (err.response?.status === 401 || err.response?.status === 403) {
        _clearSession();
      }
      // Network error → keep existing session (offline-friendly)
    }
  }

  // ── refreshUser: callable from any component ─────────────
  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (token) await refreshFromServer(token);
  }, []);

  // ── Login ─────────────────────────────────────────────────
  function login(token, userData) {
    setSession(token, userData);
    setUser(userData);
  }

  // ── Logout ────────────────────────────────────────────────
  function logout() {
    _clearSession();
  }

  function _clearSession() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
