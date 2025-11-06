'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from '../components/NotificationBell';
import { useSocket } from '../hooks/useSocket';
import Link from 'next/link';
import { Home, FileText, Shield, LogOut, Menu, X, Users, Folder, User as UserIcon } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Conectar WebSocket
  useSocket();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [pathname]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutDialog(false);
    router.push('/login');
  };

  // No mostrar el header en login/register
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return <>{children}</>;
  }

  const isAdmin = user?.role?.role === 'Administrador';
  const isSupport = user?.role?.role === 'Soporte';
  const isStaff = isAdmin || isSupport;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-500">
                FLDSMDFR
              </Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-4">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  pathname === '/dashboard'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/tickets"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  pathname.startsWith('/tickets')
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Tickets
              </Link>
              {isStaff && (
                <Link
                  href="/projects"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/projects'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Proyectos
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/users"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      pathname === '/users'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Usuarios
                  </Link>
                  <Link
                    href="/audit"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      pathname === '/audit'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Auditoría
                  </Link>
                </>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <NotificationBell />
              
              {user && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.role?.role}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/dashboard'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/tickets"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname.startsWith('/tickets')
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Tickets
                </Link>
                {isStaff && (
                  <Link
                    href="/projects"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      pathname === '/projects'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Folder className="w-4 h-4" />
                    Proyectos
                  </Link>
                )}
                {isAdmin && (
                  <>
                    <Link
                      href="/users"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                        pathname === '/users'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Usuarios
                    </Link>
                    <Link
                      href="/audit"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                        pathname === '/audit'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Auditoría
                    </Link>
                  </>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === '/profile'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Mi Perfil
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Diálogo de confirmación de logout */}
      <ConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
}
