"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import getUserProfile from "@/libs/getUserProfile";
import userLogout from "@/libs/userLogout";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try refreshing the access token using the httpOnly refresh cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        localStorage.setItem("landq_access_token", data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const loadUser = useCallback(async (token: string) => {
    try {
      const res = await getUserProfile(token);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      // Token might be expired, try refreshing
      const newToken = await refreshAccessToken();
      if (newToken) {
        try {
          const res = await getUserProfile(newToken);
          if (res.success && res.data) {
            setUser(res.data);
            return;
          }
        } catch {
          // Refresh failed
        }
      }
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("landq_access_token");
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem("landq_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
        await loadUser(storedToken);
      } else {
        // Try refresh token cookie in case user returned
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          await loadUser(refreshedToken);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [loadUser, refreshAccessToken]);

  const login = async (token: string) => {
    setAccessToken(token);
    localStorage.setItem("landq_access_token", token);
    await loadUser(token);
  };

  const logout = async () => {
    try {
      await userLogout(accessToken || undefined);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("landq_access_token");
    }
  };

  const refreshUser = async () => {
    if (accessToken) {
      await loadUser(accessToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        refreshUser,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
