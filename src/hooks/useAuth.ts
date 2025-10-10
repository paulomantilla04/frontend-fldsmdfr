"use client";

import { useState } from "react";
import { UserService } from "@/services";
import { Login, CreateUser, User } from "@/interfaces";

const userService = new UserService();

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (data: Login) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.login(data);

      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      if (response.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      return true;
    }
    return false;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return {
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated,
    loading,
    error,
    user,
  };
};
