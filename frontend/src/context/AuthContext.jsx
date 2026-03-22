import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "expense_access_token";
const REFRESH_TOKEN_KEY = "expense_refresh_token";
const USER_KEY = "expense_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [accessToken]);

  useEffect(() => {
    async function bootstrapAuth() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me/");
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      } catch (error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    bootstrapAuth();
  }, [accessToken]);

  function persistSession({ access, refresh, user: nextUser }) {
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(nextUser);
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }

  function clearSession() {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
  }

  async function login(credentials) {
    const { data } = await api.post("/auth/login/", credentials);
    persistSession(data);
    return data;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register/", payload);
    return data;
  }

  async function logout() {
    clearSession();
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      isAuthenticated: Boolean(accessToken && user),
      login,
      register,
      logout,
      clearSession,
    }),
    [user, accessToken, refreshToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
