"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const maxWaitTimeout = setTimeout(() => {
      if (loading) {

        setRedirectPath("/login");
        setShouldRedirect(true);
      }
    }, 5000);

    return () => clearTimeout(maxWaitTimeout);
  }, [mounted, loading]);

  useEffect(() => {
    if (!mounted || loading || redirectPath !== null) return;

    const path = isAuthenticated() ? "/dashboard" : "/login";
    setRedirectPath(path);
  }, [mounted, loading, isAuthenticated, redirectPath]);

  useEffect(() => {
    if (!redirectPath) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShouldRedirect(true);
    }
  }, [countdown, redirectPath]);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      router.replace(redirectPath);
    }
  }, [shouldRedirect, redirectPath, router]);

  const getRedirectMessage = () => {
    if (loading) {
      return "Verificando tu sesión...";
    }
    if (redirectPath === "/dashboard") {
      return "Tienes sesión activa. Redirigiendo al dashboard...";
    }
    if (redirectPath === "/login") {
      return "No tienes sesión activa. Redirigiendo al login...";
    }
    return "Verificando...";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md px-6">
        {/* Icono 404 */}
        <div className="mb-6">
          <div className="text-8xl font-bold text-gray-300">404</div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-3">
          Página no encontrada
        </h1>
        
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o fue movida.
        </p>

        {/* Estado de redirección */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-center mb-4">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            ) : (
              <div className="text-5xl font-bold text-blue-500">
                {countdown}
              </div>
            )}
          </div>
          
          <p className="text-gray-700 font-medium">
            {getRedirectMessage()}
          </p>

        </div>

        {/* Mensaje adicional */}
        <p className="text-xs text-gray-400 mt-4">
          Si la redirección no funciona, actualiza la página o contacta al soporte.
        </p>
      </div>
    </div>
  );
}
