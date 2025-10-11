"use client";

import { useState, useEffect } from "react";
import { UserService } from "@/services";
import { Login, CreateUser, User, RoleType } from "@/interfaces";

const userService = new UserService();

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: Login) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.login(data);

      if (typeof window !== "undefined") {
        if (response.token) {
          localStorage.setItem("token", response.token);
        }

        if (response.user) {
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: CreateUser) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.register(data);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrar usuario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setUser(null);
  };

  const checkAuth = () => {
    if (typeof window === "undefined") return false;
    
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        return true;
      } catch {
        logout();
        return false;
      }
    }
    return false;
  };

  const isAuthenticated = () => {
    if (typeof window === "undefined") return false; // Verificar si estamos en el cliente
    return !!localStorage.getItem("token");
  };

  const hasRole = (role: RoleType): boolean => {
    return user?.role?.role === role;
  };

  const hasAnyRole = (roles: RoleType[]): boolean => {
    return roles.some((role) => user?.role?.role === role);
  };

  const isAdmin = (): boolean => {
    return user?.role?.role === "Administrador";
  };

  const isSupport = (): boolean => {
    return user?.role?.role === "Soporte";
  };

  const isClient = (): boolean => {
    return user?.role?.role === "Cliente";
  };

  const getUserFullName = (): string => {
    if (!user) return "";
    return `${user.first_name} ${user.last_name}`.trim();
  };

  return {
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSupport,
    isClient,
    getUserFullName,
    loading,
    error,
    user,
  };
};
