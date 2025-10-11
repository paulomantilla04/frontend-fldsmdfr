"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RoleType } from "@/interfaces";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: RoleType[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, hasAnyRole, user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // No ejecutar si no está montado o está cargando
    if (!isMounted || loading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
      router.push(redirectTo);
      return;
    }

    // Si se requieren roles específicos, verificar
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(requiredRoles)) {
        // Si no tiene el rol requerido, redirigir a página de acceso denegado
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, hasAnyRole, requiredRoles, router, redirectTo, loading, isMounted]);

  // No renderizar nada en el servidor
  if (!isMounted) {
    return null;
  }

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated()) {
    return null;
  }

  // Si requiere roles y no los tiene, no mostrar nada (se redirigirá)
  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}
