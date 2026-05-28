import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (accessToken) => {
    setAuthToken(accessToken);
    const { data } = await authApi.me();
    setUser(data);
    return data;
  };

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      await loadUser(token);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const saveSession = async (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    await loadUser(accessToken);
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    await saveSession(data.access_token);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    await saveSession(data.access_token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    isAuthed: Boolean(token && user),
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
