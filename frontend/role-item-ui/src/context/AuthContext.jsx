import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role }
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await http.get("/api/auth/me");

      const username = res.data.username ?? res.data.userName ?? res.data.name ?? "user";

      const rawRole =
        res.data.role ??
        res.data.userRole ??
        (Array.isArray(res.data.roles) ? res.data.roles[0] : null) ??
        "User";

      const normalizedRole =
        String(rawRole).toLowerCase() === "admin"
          ? "Admin"
          : String(rawRole).toLowerCase() === "user"
          ? "User"
          : rawRole;

      setUser({ username, role: normalizedRole });
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const res = await http.post("/api/auth/login", { username, password });

    const token =
      res.data?.token ??
      res.data?.accessToken ??
      res.data?.jwt ??
      res.data?.data?.token;

    if (!token) throw new Error("Login succeeded but token not found in response.");

    localStorage.setItem("token", token);
    await refreshMe();
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
