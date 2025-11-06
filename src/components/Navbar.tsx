"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, X, Home, Ticket, Users, Folder, User } from "lucide-react";
import { useState } from "react";
import { AdminOnly, SupportOnly, StaffOnly } from "@/components/RoleBased";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Navbar() {
  const { user, logout, getUserFullName, isAdmin, isSupport, isClient } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
    router.push("/login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const getRoleBadgeColor = () => {
    if (isAdmin()) return "bg-purple-100 text-purple-800";
    if (isSupport()) return "bg-blue-100 text-blue-800";
    if (isClient()) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y Navegación Principal */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Ticket className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                FLDSMDFR
              </span>
            </Link>

            {/* Menú Desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Link>

              <Link
                href="/tickets"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <Ticket className="w-4 h-4 mr-1" />
                Tickets
              </Link>

              <StaffOnly>
                <Link
                  href="/projects"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Folder className="w-4 h-4 mr-1" />
                  Proyectos
                </Link>
              </StaffOnly>

              <Link
                href="/profile"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <User className="w-4 h-4 mr-1" />
                Perfil
              </Link>

              <AdminOnly>
                <Link
                  href="/users"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Usuarios
                </Link>
              </AdminOnly>
            </div>
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {getUserFullName()}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}
              >
                {user?.role?.role}
              </span>
            </div>

            <button
              onClick={handleLogoutClick}
              className="hidden md:flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </button>

            {/* Botón de menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Información del usuario */}
            <div className="px-3 py-2 border-b border-gray-200 mb-2">
              <p className="text-sm font-medium text-gray-900">
                {getUserFullName()}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}
              >
                {user?.role?.role}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>

            <Link
              href="/tickets"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Ticket className="w-5 h-5 mr-3" />
              Tickets
            </Link>

            <StaffOnly>
              <Link
                href="/projects"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Folder className="w-5 h-5 mr-3" />
                Proyectos
              </Link>
            </StaffOnly>

            <Link
              href="/profile"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5 mr-3" />
              Perfil
            </Link>

            <AdminOnly>
              <Link
                href="/users"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-5 h-5 mr-3" />
                Usuarios
              </Link>
            </AdminOnly>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de logout */}
      <ConfirmDialog
        open={showLogoutDialog}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="warning"
        onConfirm={handleLogoutConfirm}
        onClose={handleLogoutCancel}
      />
    </nav>
  );
}
