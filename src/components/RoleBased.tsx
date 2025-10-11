"use client";

import { useAuth } from "@/hooks/useAuth";
import { RoleType } from "@/interfaces";

interface RoleBasedProps {
  children: React.ReactNode;
  allowedRoles: RoleType[];
  fallback?: React.ReactNode;
}

/**
 * Componente que muestra contenido basado en el rol del usuario
 */
export function RoleBased({ children, allowedRoles, fallback = null }: RoleBasedProps) {
  const { hasAnyRole } = useAuth();

  if (hasAnyRole(allowedRoles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Componente que solo muestra contenido para Administradores
 */
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleBased allowedRoles={["Administrador"]} fallback={fallback}>{children}</RoleBased>;
}

/**
 * Componente que solo muestra contenido para Soporte
 */
export function SupportOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleBased allowedRoles={["Soporte"]} fallback={fallback}>{children}</RoleBased>;
}

/**
 * Componente que solo muestra contenido para Clientes
 */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleBased allowedRoles={["Cliente"]} fallback={fallback}>{children}</RoleBased>;
}

/**
 * Componente que muestra contenido para Admin y Soporte
 */
export function StaffOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleBased allowedRoles={["Administrador", "Soporte"]} fallback={fallback}>{children}</RoleBased>;
}
