/**
 * session.js — Tab-Isolated Session Management
 * ─────────────────────────────────────────────
 * Uses sessionStorage (per-tab) so different browser tabs can be logged in
 * as different users simultaneously (Admin in Tab 1, Customer in Tab 2).
 *
 * On first page load in a tab, we attempt to pre-fill from localStorage as a
 * convenience (so users don't need to log in again when opening a new tab
 * if they only have one account). The tab can then independently log in/out.
 */

const SESSION_TOKEN_KEY = "fc_tab_token";
const SESSION_USER_KEY  = "fc_tab_user";
const LS_TOKEN_KEY      = "token";
const LS_USER_KEY       = "user";

/** Get the JWT token for THIS tab */
export function getToken() {
  // Check sessionStorage first (tab-local)
  const tabToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (tabToken) return tabToken;

  // Fall back to localStorage (shared across tabs — convenient for single-account users)
  const lsToken = localStorage.getItem(LS_TOKEN_KEY);
  if (lsToken) {
    // Migrate into sessionStorage so this tab owns it independently
    sessionStorage.setItem(SESSION_TOKEN_KEY, lsToken);
    return lsToken;
  }
  return null;
}

/** Get the user object for THIS tab */
export function getStoredUser() {
  const tabUser = sessionStorage.getItem(SESSION_USER_KEY);
  if (tabUser) {
    try { return JSON.parse(tabUser); } catch { return null; }
  }
  const lsUser = localStorage.getItem(LS_USER_KEY);
  if (lsUser) {
    try {
      const parsed = JSON.parse(lsUser);
      sessionStorage.setItem(SESSION_USER_KEY, lsUser);
      return parsed;
    } catch { return null; }
  }
  return null;
}

/** Persist a session into sessionStorage (tab-local) + localStorage (cross-tab fallback) */
export function setSession(token, user) {
  const userStr = JSON.stringify(user);
  // Tab-local storage
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  sessionStorage.setItem(SESSION_USER_KEY, userStr);
  // Also write to localStorage so newly opened tabs pick it up
  localStorage.setItem(LS_TOKEN_KEY, token);
  localStorage.setItem(LS_USER_KEY, userStr);
}

/** Clear the session for THIS tab only (other tabs are unaffected) */
export function clearSession() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  // Also clear localStorage so a full logout is reflected in new tabs
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_USER_KEY);
}
