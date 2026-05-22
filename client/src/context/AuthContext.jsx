import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, setAuthToken } from "../api/client";
import { removeStorage, setStorage } from "../utils/storage";

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
      const data = await loadUser(token);
      setStorage("user", { id: data.id, full_name: data.full_name, email: data.email, role: data.role });
    } catch {
      localStorage.removeItem("token");
      removeStorage("user");
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
    const data = await loadUser(accessToken);
    setStorage("user", { id: data.id, full_name: data.full_name, email: data.email, role: data.role });
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    await saveSession(data.access_token);
    return data;
  };

  const register = async (full_name, email, password) => {
    const { data } = await authApi.register({ full_name, email, password });
    await saveSession(data.access_token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    removeStorage("user");
    removeStorage("login_email");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor" || isAdmin;

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    isAuthed: Boolean(token && user),
    isAdmin,
    isInstructor
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
